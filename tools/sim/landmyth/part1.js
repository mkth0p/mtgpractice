'use strict';
// Loads part 1's own functions (mulligan, play, rng, ...) from tools/sim/manabase/manasim.js
// without running its CLI and without editing it: the source up to its worker section is
// compiled as a function body in this realm.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'manabase', 'manasim.js');

function loadPart1() {
  const src = fs.readFileSync(FILE, 'utf8');
  const start = src.indexOf("'use strict';");
  const cut = src.indexOf('// ---------- Workers ----------');
  if (start < 0 || cut < 0) throw new Error('manasim.js layout changed');
  const body = src.slice(start, cut) +
    '\nreturn { SCENARIOS, CMD_COST, LAND, DORK, ROCK, rng, spellCurve, buildDeck, bestSpend, shuffle, mulligan, play, simCell, METRICS };';
  const fn = vm.runInThisContext('(function (require, __filename, __dirname) {' + body + '\n})', { filename: FILE });
  return fn(require, FILE, path.dirname(FILE));
}

module.exports = { loadPart1, FILE };
