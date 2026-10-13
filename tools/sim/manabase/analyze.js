#!/usr/bin/env node
// Analyse d'un results-*.json : regret par cellule (budget x scénario), classement par résilience.
// Usage : node analyze.js results-sweep-tight.json [--metric useful|useful8] [--csv out.csv]
'use strict';
const fs = require('fs');
const file = process.argv[2];
const argv = process.argv.slice(3);
const opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const metric = opt('metric') || 'useful';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const SCN = Object.keys(data.scenarios);
const key = r => `${r.lands}:${r.dorks}:${r.rocks}`;
const label = k => { const [l, d, r] = k.split(':').map(Number); return `${l} terrains + ${d + r} ramp (${d}D/${r}R) = ${l + d + r}`; };

// cellule -> meilleure valeur
const best = {};
const byCfg = {};
for (const r of data.results) {
  if (!r.cell) continue;
  for (const s of SCN) {
    const c = `${r.budget}|${s}`, v = r.cell[s][metric];
    if (!(c in best) || v > best[c]) best[c] = v;
  }
  (byCfg[key(r)] = byCfg[key(r)] || {})[r.budget] = r.cell;
}

function score(k, budgets) {
  let max = 0, sum = 0, n = 0, worstRatio = 1, ratioSum = 0;
  const cells = byCfg[k];
  for (const b of budgets) {
    if (!cells[b]) return null; // config impossible à ce budget
    for (const s of SCN) {
      const v = cells[b][s][metric], bv = best[`${b}|${s}`];
      const reg = bv - v; max = Math.max(max, reg); sum += reg; n++;
      worstRatio = Math.min(worstRatio, v / bv); ratioSum += v / bv;
    }
  }
  return { k, maxReg: max, meanReg: sum / n, worstRatio, meanRatio: ratioSum / n };
}

const fmt = (x, d = 2) => x.toFixed(d);
const lines = [];
const P = s => lines.push(s);
P(`# Résultats : ${file}  (métrique : ${metric}, ${data.opts.games} parties/cellule, courbe ${data.opts.curve}, ${data.opts.turns} tours)`);
P('');
P('Regret = mana utile du meilleur deck de la cellule (même budget, même scénario) moins celui de la config. Plus petit = plus résilient.');
P('');

// 1) Global, tous budgets x tous scénarios
const allB = data.budgets;
const keys = Object.keys(byCfg);
const glob = keys.map(k => score(k, allB)).filter(Boolean).sort((a, b) => a.maxReg - b.maxReg);
P('## Tous les budgets testés et tous les scénarios');
P('| rang | config | regret max | regret moyen | pire % du meilleur |');
P('|---|---|---|---|---|');
glob.slice(0, 15).forEach((g, i) => P(`| ${i + 1} | ${label(g.k)} | ${fmt(g.maxReg)} | ${fmt(g.meanReg)} | ${fmt(100 * g.worstRatio, 1)}% |`));
for (const ref of ['32:5:5', '32:6:6']) {
  const i = glob.findIndex(g => g.k === ref);
  if (i >= 0) P(`| ${i + 1} | **${label(ref)}** (intuition) | ${fmt(glob[i].maxReg)} | ${fmt(glob[i].meanReg)} | ${fmt(100 * glob[i].worstRatio, 1)}% |`);
}
P(`(${glob.length} configs faisables à tous les budgets)`);
P('');

// 2) Par budget : la config la plus résiliente sur P1-P8
P('## Par budget (ou CMC moyen) : config la plus résiliente sur P1 à P8');
P('| budget | CMC moyen sorts | meilleure config (regret max) | 2e | 3e | 32+10 regret max (rang) | 32+12 regret max (rang) |');
P('|---|---|---|---|---|---|---|');
const perBudget = {};
for (const b of allB) {
  const rk = keys.map(k => score(k, [b])).filter(Boolean).sort((x, y) => x.maxReg - y.maxReg);
  perBudget[b] = rk;
  const ref = k => { const i = rk.findIndex(g => g.k === k); return i < 0 ? 'n/a' : `${fmt(rk[i].maxReg)} (${i + 1})`; };
  const top = g => `${g.k.split(':')[0]}T+${+g.k.split(':')[1] + +g.k.split(':')[2]}R (${fmt(g.maxReg)})`;
  P(`| ${b} | ${fmt(byCfg[rk[0].k][b].avgSpellCmc)} | ${top(rk[0])} | ${top(rk[1])} | ${top(rk[2])} | ${ref('32:5:5')} | ${ref('32:6:6')} |`);
}
P('');

// 3) Détail des métriques de quelques configs à un budget médian
const show = Array.from(new Set([glob[0].k, glob[1].k, glob[2].k, '32:5:5', '32:6:6', '36:3:3', '38:2:3', '34:3:3']))
  .filter(k => byCfg[k]);
for (const b of [150, 180, 210]) {
  P(`## Détail au budget ${b} (moyennes par partie, ${data.opts.turns} tours)`);
  P('| config | scén. | mana générée | utile | ramp | non utilisée | sorts joués | sorts utiles en main | cmdt T4 |');
  P('|---|---|---|---|---|---|---|---|---|');
  for (const k of show) {
    const c = byCfg[k][b]; if (!c) continue;
    for (const s of ['P1', 'P4', 'P8']) {
      const m = c[s];
      P(`| ${label(k)} | ${s} | ${fmt(m.gen, 1)} | ${fmt(m.useful, 1)} | ${fmt(m.ramp, 1)} | ${fmt(m.unused, 1)} | ${fmt(m.spells, 1)} | ${fmt(m.left, 1)} | ${fmt(100 * m.cmdT4, 0)}% |`);
    }
  }
  P('');
}

// 4) Meilleur nombre de sources par scénario (moyenne sur les budgets)
P('## Config qui maximise la mana utile, scénario par scénario (moyenne sur les 11 budgets)');
P('| scénario | meilleure config | mana utile |');
P('|---|---|---|');
for (const s of SCN) {
  let bk = null, bv = -1;
  for (const k of keys) {
    let sum = 0, ok = true;
    for (const b of allB) { if (!byCfg[k][b]) { ok = false; break; } sum += byCfg[k][b][s][metric]; }
    if (ok && sum / allB.length > bv) { bv = sum / allB.length; bk = k; }
  }
  P(`| ${s} | ${label(bk)} | ${fmt(bv, 1)} |`);
}
console.log(lines.join('\n'));

const csv = opt('csv');
if (csv) {
  const rows = ['lands,dorks,rocks,sources,budget,scenario,avgSpellCmc,gen,useful,ramp,unused,spells,rampCast,left,cmdT4,cmdTurn,gen8,useful8,usefulSd'];
  for (const r of data.results) if (r.cell) for (const s of SCN) {
    const m = r.cell[s];
    rows.push([r.lands, r.dorks, r.rocks, r.lands + r.dorks + r.rocks, r.budget, s, r.cell.avgSpellCmc.toFixed(3),
      ...['gen', 'useful', 'ramp', 'unused', 'spells', 'rampCast', 'left', 'cmdT4', 'cmdTurn', 'gen8', 'useful8', 'usefulSd'].map(x => m[x].toFixed(3))].join(','));
  }
  fs.writeFileSync(csv, rows.join('\n'));
}
