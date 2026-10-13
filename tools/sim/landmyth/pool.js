#!/usr/bin/env node
'use strict';
// Real card pool behind the real-ramp variant (PREREG change log 2026-10-13, ju).
//
// Counts the Commander-legal mana rocks and mana dorks in each ramp class the model can play,
// for every one of the 32 colour identities (Scryfall `id<=X`: the card's colour identity is a
// subset of the deck's), and writes pool-caps.json. Reads a Scryfall "default-cards" bulk dump
// (one JSON card per line, gzipped); the default is the dump committed in this repo.
//
//   node pool.js [--dump path/default-cards.jsonl.gz] [--out pool-caps.json] [--list]
//
// Equivalent Scryfall queries (for a reader with web access; this container could not reach
// api.scryfall.com, so the dump is used): every class is "f:commander -t:land" plus
//   rocks: t:artifact -t:creature, dorks: t:creature, and
//   sol   mv=1, makes 2 mana, untaps (Sol Ring)            o:"{T}: Add {C}{C}" mv=1
//   mox0  mv=0, makes 1 mana, stays (Chrome Mox, Mox Diamond, Mox Opal, Mox Amber...)
//   rock2 mv=2, net 1, enters untapped (Arcane Signet, Talismans, Signets, Fellwar Stone...)
//   rock2t mv=2, net 1, enters tapped (the Diamonds, Coldsteel Heart)
//   rock3 mv=3, net 1+, untapped (Commander's Sphere, Chromatic Lantern, Banners, Lockets...)
//   rock4 mv>=4, net 2+ (Thran Dynamo, Hedron Archive, Gilded Lotus...)
//   dork1 mv=1 creature, dork2 mv=2 creature, dork3 mv=3 creature
// "Clean" mana ability: a line "{T}: Add ..." or "{N}, {T}: Add ..." (signets: net = out - N) with
// no other cost (no sacrifice, discard, tapping other creatures), no "Spend this mana only" or
// "Activate only", on a card that untaps normally and is not a one-shot. Variable output
// ("for each ...") counts as 1. Level-up cards are excluded. Hand-checked exceptions are in FIX.
// "Realistic" = clean and EDHREC rank <= REALISTIC_RANK (the dump's edhrec_rank: rank of the
// card by number of EDHREC decks; ~3,000 of ~32,000 legal cards). Other thresholds are written too.
const fs = require('fs'), zlib = require('zlib'), path = require('path');

const COLORS = ['W', 'U', 'B', 'R', 'G'];
const REALISTIC_RANK = 3000;
const RANKS = [Infinity, 5000, 3000, 1500];
const DEFAULT_DUMP = path.join(__dirname, '../../../research/miku-tournament/local/scryfall/default-cards.jsonl.gz');
// Hand-checked exceptions (name -> class or null to drop), with the reason.
const FIX = {
  'Arbor Elf': ['dork1', '{T}: Untap target Forest: a 1-mana dork in any deck with Forests'],
  'Everflowing Chalice': ['rock2', 'mana value 0 but cast for {2} with one charge counter: a 2-mana +1 rock'],
  'Sol Talisman': [null, 'no mana cost (suspend only)'],
  'Mox Tantalite': [null, 'no mana cost (suspend 3)'],
  'Lotus Bloom': [null, 'no mana cost (suspend), one-shot'],
  'Joraga Treespeaker': [null, 'level up: no mana ability until levelled'],
  'Gilded Lotus': ['rock4', 'three mana of one colour'],
  'Coveted Jewel': ['rock4', 'three mana of one colour'],
};

function arg(k, d) { const i = process.argv.indexOf('--' + k); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : (i > 0 ? true : d); }

// Parse the clean mana abilities of an oracle text. Returns the best net output (or 0 if none).
function cleanNet(text) {
  let best = 0;
  for (const line of text.split('\n')) {
    const m = /^([^:]*): Add (.*)$/.exec(line.trim());
    if (!m) continue;
    const cost = m[1].trim(), add = m[2];
    if (!/\{T\}/.test(cost)) continue;
    const cm = /^(?:\{(\d+)\}, )?\{T\}$/.exec(cost); // only {T} or {N}, {T}
    if (!cm) continue;
    if (/Spend this mana only|Activate only|only if|Activate this ability only/i.test(add)) continue;
    let out;
    if (/^(one|1) mana|^an amount|for each/i.test(add)) out = 1;
    else if (/^two mana/i.test(add)) out = 2;
    else if (/^three mana/i.test(add)) out = 3;
    else if (/^X mana/i.test(add)) out = 1;
    else {
      const first = add.split(/,? or |, /)[0];
      out = (first.match(/\{[WUBRGC]\}/g) || []).length;
    }
    best = Math.max(best, out - (cm[1] ? +cm[1] : 0));
  }
  return best;
}

function classify(c) {
  const f = c.card_faces ? c.card_faces[0] : c;
  const tl = f.type_line || c.type_line || '', text = f.oracle_text || c.oracle_text || '';
  if (/Land/.test(tl) || c.layout === 'leveler') return null;
  const fix = FIX[c.name];
  const mv = c.cmc, creature = /Creature/.test(tl), artifact = /Artifact/.test(tl);
  if (fix) return fix[0] ? { cls: fix[0], net: 1, note: fix[1] } : null;
  if (!creature && !artifact) return null;
  if (/doesn't untap during/i.test(text)) return null;
  if (/^Sacrifice|, Sacrifice/m.test(text) && cleanNet(text) === 0) return null;
  if (!(f.mana_cost || c.mana_cost) && mv === 0) return null; // no mana cost (suspend-only)
  const net = cleanNet(text);
  if (net < 1) return null;
  const tapped = /enters( the battlefield)? tapped/i.test(text);
  if (creature) return { cls: mv <= 1 ? 'dork1' : mv === 2 ? 'dork2' : mv === 3 ? 'dork3' : null, net };
  if (mv === 0) return { cls: 'mox0', net };
  if (mv === 1) return { cls: net >= 2 ? 'sol' : 'rock1', net };
  if (mv === 2) return { cls: tapped ? 'rock2t' : 'rock2', net };
  if (mv === 3) return { cls: tapped ? 'rock3t' : 'rock3', net };
  return { cls: net >= 2 ? 'rock4' : 'rock4plus1', net };
}

function identities() { // all 32 subsets of WUBRG, as strings in WUBRG order ('' = colourless)
  const out = [];
  for (let m = 0; m < 32; m++) out.push(COLORS.filter((_, i) => m & (1 << i)).join(''));
  return out;
}

async function main() {
  const dump = arg('dump', DEFAULT_DUMP), outFile = arg('out', path.join(__dirname, 'pool-caps.json'));
  const lines = require('readline').createInterface({ input: fs.createReadStream(dump).pipe(zlib.createGunzip()), crlfDelay: Infinity });
  const seen = new Set(), cards = [];
  let maxReleased = '';
  for await (const l of lines) {
    if (!l.trim()) continue;
    const c = JSON.parse(l);
    if (c.released_at > maxReleased) maxReleased = c.released_at;
    const oid = c.oracle_id || (c.card_faces && c.card_faces[0].oracle_id);
    if (seen.has(oid)) continue;
    if (!c.legalities || c.legalities.commander !== 'legal') continue;
    if (['token', 'emblem', 'art_series', 'double_faced_token'].includes(c.layout)) continue;
    seen.add(oid);
    const k = classify(c);
    if (!k || !k.cls) continue;
    cards.push({ name: c.name, cls: k.cls, ci: (c.color_identity || []).join(''), rank: c.edhrec_rank == null ? null : c.edhrec_rank, mv: c.cmc, net: k.net, gc: !!c.game_changer });
  }
  const classes = [...new Set(cards.map(x => x.cls))].sort();
  const sub = (ci, id) => [...ci].every(ch => id.includes(ch));
  const caps = {};
  for (const id of identities()) {
    const key = id || 'C';
    caps[key] = {};
    for (const cls of classes) {
      caps[key][cls] = RANKS.map(r => cards.filter(x => x.cls === cls && sub(x.ci, id) && (r === Infinity || (x.rank != null && x.rank <= r))).length);
    }
  }
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    source: `Scryfall default-cards bulk dump ${path.relative(path.join(__dirname, '../../..'), dump)} (latest released_at in file ${maxReleased}); Commander legality and EDHREC rank as recorded in the dump`,
    rule: 'counts per colour identity X = cards with color_identity subset of X (Scryfall id<=X), f:commander, -t:land; clean mana ability as described in pool.js',
    queries: { // Scryfall syntax equivalent to each class (then id<=X per identity); the clean-ability filter is applied in code
      sol: 'f:commander t:artifact -t:creature mv=1 o:"{T}: Add {C}{C}"',
      mox0: 'f:commander t:artifact -t:creature mv=0 o:"{T}: Add" -o:sacrifice',
      rock2: 'f:commander t:artifact -t:creature mv=2 o:"{T}: Add" -o:"enters tapped"',
      rock2t: 'f:commander t:artifact -t:creature mv=2 o:"{T}: Add" o:"enters tapped"',
      rock3: 'f:commander t:artifact -t:creature mv=3 o:"{T}: Add" -o:"enters tapped"',
      rock4: 'f:commander t:artifact -t:creature mv>=4 o:"{T}: Add"',
      dork1: 'f:commander t:creature mv=1 o:"{T}: Add"', dork2: 'f:commander t:creature mv=2 o:"{T}: Add"', dork3: 'f:commander t:creature mv=3 o:"{T}: Add"',
      realistic: 'and EDHREC rank <= ' + REALISTIC_RANK + ' (Scryfall order:edhrec)',
    },
    ranks: RANKS.map(r => (r === Infinity ? 'all' : `rank<=${r}`)),
    realisticRank: REALISTIC_RANK,
    legalCards: seen.size,
    caps,
    cards: cards.sort((a, b) => a.cls.localeCompare(b.cls) || (a.rank ?? 1e9) - (b.rank ?? 1e9)),
    fixes: FIX,
  };
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  console.log(`${seen.size} legal cards; ${cards.length} rocks and dorks in classes ${classes.join(', ')}; wrote ${outFile}`);
  const show = ['C', 'G', 'W', 'B', 'WG', 'BG', 'UR', 'UBG', 'WUBRG'];
  console.log('identity  ' + classes.map(c => c.padEnd(18)).join(''));
  for (const id of show) console.log(id.padEnd(10) + classes.map(c => caps[id][c].map(x => String(x).padStart(4)).join('').padEnd(18)).join(''));
  if (arg('list')) for (const cls of classes) console.log(cls + ': ' + cards.filter(x => x.cls === cls && x.rank != null && x.rank <= REALISTIC_RANK).map(x => `${x.name}(${x.ci || 'C'})`).join('; '));
}

module.exports = { classify, cleanNet, identities };
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
