/* node scripts/build-pool.js: writes pool/pool.tsv, the candidate pool of each shortlisted commander (step 6), from:
   - every card of that commander's draft lists (draft/<cmdr>-*.txt);
   - every card in at least 2 kept public lists for that commander (work/lists/<cmdr>-frequency.tsv; for green-white,
     the Shalai and Trostani tables combined, since one 99 serves both);
   - every piece of a win line in combos.json inside the commander's color identity;
   keeping only Commander-legal cards inside the identity (Scryfall bulk). Roles come from the card's Oracle text and type
   (rules below); the reason is one sentence built from the role, the win line the card belongs to, and how many kept public
   lists play it. Basic lands are left out of the pool. */
"use strict";
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
const idx = require("../scryfall/index.json");
const combos = JSON.parse(fs.readFileSync(path.join(root, "combos.json"), "utf8"));
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
const BASIC = /^(Plains|Island|Swamp|Mountain|Forest|Wastes)$/;
const CMD = {
  child: { ci: "WUBRG", label: "Child of Alara", freq: ["child-of-alara"], drafts: ["child-uncapped", "child-1500"] },
  brago: { ci: "WU", label: "Brago", freq: ["brago"], drafts: ["brago-uncapped", "brago-1500"] },
  shalai: { ci: "GW", label: "Shalai/Trostani", freq: ["shalai", "trostani"], drafts: ["shalai-uncapped", "shalai-1500"] }
};
function freqOf(k) { // card -> number of kept lists (max over the tables of a commander), plus the number of lists
  const m = new Map(); let lists = 0;
  for (const f of CMD[k].freq) {
    const L = fs.readFileSync(path.join(root, `work/lists/${f}-frequency.tsv`), "utf8").split("\n");
    const h = L.find(l => l.startsWith("#")); const n = h ? +((h.match(/# (\d+) kept/) || [])[1] || 0) : 0; lists += n;
    for (const l of L) { const [card, cnt] = l.split("\t"); if (!card || card.startsWith("#") || card === "card") continue; m.set(card, (m.get(card) || 0) + (+cnt || 0)); }
  }
  return { m, lists };
}
function roles(c, inCombo) {
  const t = (c.oracle_text != null ? c.oracle_text : (c.faces || []).map(f => f.oracle_text).join("\n")).toLowerCase(), ty = c.type_line;
  const r = [];
  if (inCombo.length) r.push("win-line");
  if (/Land/.test(ty.split(" // ")[0])) { r.push("land"); return r; }
  const mana = /add \{|add (one|two|three) mana|add .*mana of any|adds? an additional/.test(t);
  if (/search your library for (a|an|up to (one|two)|any) (?!basic land|land)/.test(t) && !/search your library for (a|up to \w+) basic land/.test(t) || /\bwish\b|transmute|look at the top \w+ cards of your library.*put (one|it|a card).* into your hand/.test(t) && /tutor|search/.test(t)) r.push("tutor");
  if (mana && (c.cmc <= 2 && /Artifact/.test(ty) || /^(Instant|Sorcery)/.test(ty) && /add \{/.test(t) || c.cmc === 0)) r.push("fast-mana");
  else if (mana || /search your library for (a|an|up to \w+) (basic )?(land|forest|plains|island|swamp|mountain)/.test(t)) r.push("ramp");
  if (/counter target (spell|activated|noncreature|creature|instant)/.test(t)) r.push("counterspell");
  if (/(destroy|exile) (up to (one|two) )?target|return target (nonland )?(spell or permanent|permanent|creature|artifact|enchantment)[^.]*to its owner's hand|destroy all|exile all|-\d\/-\d|deals \w+ damage to (any|target)/.test(t) && !/target (card|nonland permanent|creature|permanent|artifact) you control/.test(t)) r.push("interaction");
  if (/hexproof|indestructible|phase out|phases out|can't be countered|protection from|your opponents can't cast spells during your turn|can't cast spells during your turn/.test(t)) r.push("protection");
  if (/(each|your) opponents? can't|players can't|can't cast|spells cost \{\d\} more|can't be activated|don't untap|skip/.test(t) && !r.includes("protection")) r.push("stax");
  if (/draw (a|two|three|x|that many|cards|\w+ cards)/.test(t)) r.push("draw");
  if (/exile (up to )?(one |another )?target .*(then|, then) return|exile any number of target nonland permanents you control, then return/.test(t)) r.push("blink");
  if (!r.length) r.push("value");
  return r;
}
const LABEL = { "win-line": "Win-line piece", land: "Land", tutor: "Tutor", "fast-mana": "Fast mana", ramp: "Ramp", counterspell: "Counterspell", interaction: "Interaction", protection: "Protection", stax: "Rule-setter", draw: "Card draw", blink: "Blink", value: "Value" };
const FN = { tutor: "finds the missing win-line piece or the answer the turn needs", "fast-mana": "costs less than it makes, so the go-off turn comes a turn earlier", ramp: "adds mana or lands toward a turn-5-6 kill", counterspell: "stops a wipe, a removal spell on a combo piece, or an opponent's win", interaction: "answers the creature, artifact or enchantment an opponent wins with", protection: "keeps the combo or the board alive through removal, wipes or counters", stax: "slows the opposing decks (taxes, locks) while the deck sets up", draw: "refills the hand so the deck finds its pieces", blink: "reuses enter-the-battlefield effects and untaps permanents", value: "adds board presence or card quality", land: "produces the deck's colors" };
const pool = new Map();
for (const k of Object.keys(CMD)) {
  const { ci, label } = CMD[k], { m: fq, lists } = freqOf(k);
  const names = new Set();
  for (const d of CMD[k].drafts) for (const n of fs.readFileSync(path.join(root, `draft/${d}.txt`), "utf8").split("\n").map(s => s.trim()).filter(Boolean)) names.add(n);
  for (const [n, cnt] of fq) if (cnt >= 2) names.add(n);
  for (const cb of combos) if (cb.colors === "C" || [...cb.colors].every(x => ci.includes(x))) cb.pieces.forEach(p => names.add(p));
  let kept = 0;
  for (const n of names) {
    if (BASIC.test(n)) continue;
    const c = find(n); if (!c || c.legal_commander !== "legal" || !c.color_identity.every(x => ci.includes(x))) continue;
    kept++;
    const inCombo = combos.filter(cb => cb.pieces.includes(c.name) && (cb.colors === "C" || [...cb.colors].every(x => ci.includes(x))));
    const e = pool.get(c.name) || { name: c.name, roles: new Set(), fors: new Set(), combos: new Set(), why: {} };
    roles(c, inCombo).forEach(r => e.roles.add(r)); e.fors.add(k); inCombo.forEach(cb => e.combos.add(cb.id));
    const n2 = fq.get(c.name) || 0;
    e.why[k] = `${n2} of ${lists} kept public ${label} lists`;
    pool.set(c.name, e);
  }
  console.log(`${k}: ${kept} cards in the pool`);
}
const rows = ["name\troles\tfor_commanders\tcombos\twhy"];
for (const e of [...pool.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  const rl = [...e.roles], main = rl.find(r => r !== "win-line") || rl[0];
  const cb = [...e.combos].map(id => combos.find(x => x.id === id).name);
  const lead = cb.length ? `Piece of ${cb.slice(0, 2).join(" and of ")}${cb.length > 2 ? ` (+${cb.length - 2} more lines)` : ""}; also ${LABEL[main].toLowerCase()} that ${FN[main]}` : `${LABEL[main]} that ${FN[main]}`;
  rows.push([e.name, rl.join(","), [...e.fors].join(","), [...e.combos].join(","), `${lead} (in ${Object.values(e.why).join("; ")}).`].join("\t"));
}
fs.mkdirSync(path.join(root, "pool"), { recursive: true });
fs.writeFileSync(path.join(root, "pool/pool.tsv"), rows.join("\n") + "\n");
console.log(`pool/pool.tsv: ${rows.length - 1} unique cards`);
