/* Mana shape of a decklist (step 9 of LOCAL-PROMPT.md), counted from each card's Oracle text in Scryfall's bulk data
   (scryfall/index.json), never from a site's tags.
     node scripts/shape.js csv          -> public-lists-shape.csv, one row per kept public list in work/lists/
     node scripts/shape.js deckshape    -> deckshape-<commander>-<name>.json for each decklist-*.txt
   Definitions (all on the 99 plus the commander; a card counts in one mana category at most, checked in this order):
     lands              front face is a Land (modal double-faced cards with a land back count as spells; noted)
     dorks              creatures with a mana ability ("{T}: Add", "Add {" or "add ... mana")
     rituals            instants and sorceries that add mana
     land_ramp_spells   nonland cards that put lands onto the battlefield or grant extra land plays
     accelerants_0_1mv  other nonland permanents (artifacts, enchantments) that make mana, mana value 0-1
     accelerants_2mv    the same at mana value 2 (3+ mana rocks are not accelerants here; they count as spells)
     draw_engines       permanents that draw more than once ("whenever ... draw", "at the beginning of ... draw",
                        activated draw, "draw an additional card")
     cantrips           instants and sorceries of mana value 2 or less that draw a card
     tutors             "search your library for" a card that isn't only a land, transmute, or a wish
     mana_sinks         permanents with an activated ability whose cost includes generic or X mana and that isn't a
                        mana ability (repeatable uses for spare mana)
     x_spells           cards with {X} in their mana cost
     avg_mv_nonland     mean mana value of the nonland cards
     curve_1..curve_7plus   nonland cards by mana value (curve_1 includes mana value 0)
   Deckshape JSON (input for tools/sim/manamodel.js-style models): lands; ramp [{name, mv, fast, net}] with fast = makes
   mana the turn it is cast and net = mana it adds each turn after paying for itself (rituals: the one-time gain); spells
   [{name, mv}]; draw [{name, extra, why}] with extra = cards it draws beyond the normal draw in a typical first 8 turns
   (an estimate, with the reasoning); sinks [{name, cost, what}]. */
"use strict";
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const idx = require("../scryfall/index.json");
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n || x.name.toLowerCase() === n.toLowerCase());
// Oracle text without reminder text in parentheses (so "(It's an artifact with \"... Add one mana ...\")" doesn't count)
const textOf = c => (c.oracle_text != null ? c.oracle_text : (c.faces || []).slice(0, 1).map(f => f.oracle_text).join("\n")).replace(/\([^()]*\)/g, "");
const front = c => (c.faces && c.oracle_text == null ? c.faces[0] : c);
const isLand = c => /Land/.test((front(c).type_line || c.type_line).split(" // ")[0]);
const makesMana = t => /\b(you (may )?)?create (a|an|one|two|\w+) (food token or a )?treasure|\{T\}[^.:]*: Add|Add \{|add (one|two|three|X|an amount of) (mana|\{)|adds? an additional|Add one mana|add that much/i.test(t);
const isPermanentType = ty => !/^(Instant|Sorcery)/.test(ty);

function classify(c) {
  const t = textOf(c), ty = front(c).type_line || c.type_line, low = t.toLowerCase();
  const r = { land: false, dork: false, ritual: false, landRamp: false, acc: false, draw: false, cantrip: false, tutor: false, sink: false, x: /\{X\}/.test(c.mana_cost || "") };
  if (isLand(c)) { r.land = true; return r; }
  const creature = /Creature/.test(ty);
  if (creature && makesMana(t)) r.dork = true;
  else if (/^(Instant|Sorcery)/.test(ty) && /add \{|add (one|two|three) mana|add \w+ mana/i.test(t) && !/search your library/i.test(t)) r.ritual = true;
  else if (/search your library for (a|an|up to \w+|two) (basic )?(land|forest|plains|island|swamp|mountain)[^.]*onto the battlefield|put (a|up to \w+) land cards? from your hand onto the battlefield|you may play (an|two) additional lands?|play an additional land/i.test(t)) r.landRamp = true;
  else if (isPermanentType(ty) && makesMana(t)) r.acc = true;
  if (isPermanentType(ty) && /(whenever|at the beginning of)[^.]*\b(draws?|you draw) (a|two|three|an additional|\w+) cards?|\{T\}[^:]*: draw|: [^.]*\bdraw (a|two|\w+) cards?|then draw a card for each|draw an additional card|draws? two additional|you may pay[^.]*draw|if they don't, you draw|if that player doesn't, you draw|exile the top card of your library face down\. put that card into your hand/i.test(low) && !/^[^.]*draw step[^.]*$/.test(low.split("\n").filter(l => /draw/.test(l)).join(" ") ) ) r.draw = true;
  if (/^(Instant|Sorcery)/.test(ty) && c.cmc <= 2 && /draw (a|two|three) cards?/i.test(t)) r.cantrip = true;
  { const m = low.match(/search(es)? (your|their) library( and\/or graveyard)? for ([^.]*?)card/); if (m && !/\b(land|forest|plains|island|swamp|mountain|gate)s?\b/.test(m[4])) r.tutor = true; }
  if (/transmute|\bwish\b/i.test(low)) r.tutor = true;
  if (isPermanentType(ty)) {
    for (const line of t.split("\n")) {
      const m = line.match(/^([^:"]*\{[^:"]*\}[^:"]*):\s*(.*)$/);
      if (!m) continue;
      const cost = m[1], eff = m[2];
      if (/^(Equip|Level up|Cycling|Ninjutsu|Crew|Flashback|Escape|Embalm|Eternalize|Unearth|Encore|Dash|Evoke|Channel|Boast)/i.test(cost)) continue;
      if (/\{(\d+|X)\}/.test(cost) && !/^add\b/i.test(eff) && !/add \{/i.test(eff) && !/^untap /i.test(eff)) { r.sink = true; break; }
    }
  }
  return r;
}
function readList(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/), cards = [], meta = {};
  for (const l of lines) {
    const s = l.trim(); if (!s) continue;
    if (s.startsWith("#")) { const m = s.match(/^#\s*([\w ]+?):\s*(.*)$/); if (m) meta[m[1].toLowerCase()] = m[2]; else meta.notes = (meta.notes || "") + s; continue; }
    const m = s.match(/^(\d+)\s+(.+)$/); if (m) for (let i = 0; i < +m[1]; i++) cards.push(m[2].trim()); else cards.push(s);
  }
  return { cards, meta };
}
function shape(cards) {
  const o = { lands: 0, accelerants_0_1mv: 0, accelerants_2mv: 0, dorks: 0, rituals: 0, land_ramp_spells: 0, draw_engines: 0, cantrips: 0, tutors: 0, mana_sinks: 0, x_spells: 0, avg_mv_nonland: 0, curve_1: 0, curve_2: 0, curve_3: 0, curve_4: 0, curve_5: 0, curve_6: 0, curve_7plus: 0, unknown: [] };
  let mv = 0, nl = 0;
  for (const n of cards) {
    const c = find(n); if (!c) { o.unknown.push(n); continue; }
    const r = classify(c);
    if (r.land) { o.lands++; continue; }
    nl++; mv += c.cmc;
    o[`curve_${c.cmc >= 7 ? "7plus" : Math.max(1, Math.round(c.cmc))}`]++;
    if (r.dork) o.dorks++; else if (r.ritual) o.rituals++; else if (r.landRamp) o.land_ramp_spells++; else if (r.acc) { if (c.cmc <= 1) o.accelerants_0_1mv++; else if (c.cmc === 2) o.accelerants_2mv++; }
    if (r.draw) o.draw_engines++; if (r.cantrip) o.cantrips++; if (r.tutor) o.tutors++; if (r.sink) o.mana_sinks++; if (r.x) o.x_spells++;
  }
  o.avg_mv_nonland = nl ? +(mv / nl).toFixed(2) : 0;
  return o;
}
const COLS = ["commander", "source_url", "date", "bracket_or_tag", "lands", "accelerants_0_1mv", "accelerants_2mv", "dorks", "rituals", "land_ramp_spells", "draw_engines", "cantrips", "tutors", "mana_sinks", "x_spells", "avg_mv_nonland", "curve_1", "curve_2", "curve_3", "curve_4", "curve_5", "curve_6", "curve_7plus"];
const q = s => /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);

/* hand estimates for the deckshape "draw" entries: extra cards over a typical first 8 turns */
const DRAW_EST = {
  "Rhystic Study": [4, "cast about turn 2-3; opponents pay {1} part of the time; about one card every one or two opponent spells from then on"],
  "Mystic Remora": [3, "cast turn 1-2 and kept 2-3 upkeeps; opponents cast noncreature spells and often don't pay {4}"],
  "Esper Sentinel": [2, "a card on most opponents' first noncreature spell each turn until it dies or they pay"],
  "Smothering Tithe": [0, "makes Treasures, not cards; counted in ramp, not draw"],
  "The One Ring": [5, "cast turn 3-4; draws 1, 2, 3 on the following turns before the life loss matters"],
  "Sylvan Library": [3, "draw two extra each turn and keep one by paying 4 life about half the time from turn 2"],
  "Archivist of Oghma": [2, "opponents' fetchlands and tutors trigger it about twice by turn 8"],
  "Skullclamp": [4, "equip a 1-toughness creature or token about twice"],
  "Mulldrifter": [2, "draws two on entering (more with blinks)"],
  "Wall of Omens": [1, "draws one on entering (more with blinks)"],
  "Omen of the Sea": [1, "draws one on entering (scry 2)"],
  "Aether Channeler": [1, "one draw mode on entering (more with Brago blinks)"],
  "Sea Gate Oracle": [1, "one card to hand on entering"],
  "Cryogen Relic": [1, "draws on entering or leaving; Brago blinks repeat it"],
  "Solemn Simulacrum": [1, "draws when it dies"],
  "Necropotence": [6, "pay life for cards in a key turn; about 6 cards"],
  "Faerie Mastermind": [2, "an opponent's second draw each turn"],
  "Eternal Witness": [1, "returns a card (card advantage, not a draw)"]
};
function deckshape(file) {
  const { cards } = readList(file);
  const out = { list: path.basename(file), commander: cards[0], lands: [], ramp: [], spells: [], draw: [], sinks: [] };
  for (const n of cards) {
    const c = find(n); if (!c) continue;
    const r = classify(c), t = textOf(c);
    if (r.land) { out.lands.push(n); continue; }
    if (r.dork || r.ritual || r.landRamp || r.acc) {
      let fast = !r.dork && !(r.landRamp && /tapped/i.test(t)), net = 1;
      const add = (t.match(/Add (\{[WUBRGC]\})+/) || [""])[0], made = (add.match(/\{/g) || []).length || 1;
      if (r.ritual) net = Math.max(0, made - c.cmc);
      else if (r.acc || r.dork) { const untapCost = /\{(\d+)\}, \{T\}: Add/.exec(t); net = untapCost ? Math.max(0, made - +untapCost[1]) : made; if (/doesn't untap/i.test(t)) net = made; }
      else if (r.landRamp) net = /two basic land|two land/i.test(t) ? 2 : 1;
      out.ramp.push({ name: n, mv: c.cmc, fast, net, note: r.ritual ? "one-shot: net is the mana gained when cast" : /doesn't untap|untap/i.test(t) && /Monolith|Mana Vault/.test(n) ? "doesn't untap normally: net is its one tap" : undefined });
      continue;
    }
    out.spells.push({ name: n, mv: c.cmc });
    if (r.draw || r.cantrip || DRAW_EST[n]) { const e = DRAW_EST[n] || [r.cantrip ? 1 : 2, r.cantrip ? "a cantrip: replaces itself" : "a repeatable draw effect; about two extra cards by turn 8 (rough default)"]; if (e[0] > 0) out.draw.push({ name: n, extra: e[0], why: e[1] }); }
    if (r.sink || r.x) { const line = t.split("\n").find(l => /^[^:"]*\{(\d+|X)\}[^:"]*:/.test(l)) || (r.x ? `X spell ${c.mana_cost}` : ""); out.sinks.push({ name: n, cost: (line.split(":")[0] || c.mana_cost || "").trim(), what: (line.split(":").slice(1).join(":") || "X spell").trim() }); }
  }
  out.totals = { lands: out.lands.length, ramp: out.ramp.length, spells: out.spells.length, extra_draws_8_turns: out.draw.reduce((s, d) => s + d.extra, 0), sinks: out.sinks.length };
  return out;
}

const mode = process.argv[2];
if (mode === "csv") {
  const dir = path.join(root, "work/lists"), rows = [COLS.join(",")];
  let kept = 0, skipped = [];
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".txt")).sort()) {
    const { cards, meta } = readList(path.join(dir, f));
    const blob = JSON.stringify(meta);
    if (/DISCARDED|"kept":"no|reference only|not counted/i.test(blob)) { skipped.push(f); continue; }
    const url = meta.url || (meta.source || "").split(/[ ,(]/)[0];
    const date = meta.updated || ((meta.title || "").match(/updated (\d{4}-\d{2}-\d{2})/) || [])[1] || ((meta.title || "").match(/(\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/) || [])[2] || "";
    const br = meta.bracket || ((meta.title || "").match(/bracket ([^;]+)/i) || [])[1] || (/cedh/i.test(f) ? "cEDH (EDHREC average)" : /optimized/i.test(f) ? "Optimized (EDHREC average)" : "");
    const s = shape(cards);
    rows.push([cards[0], url, date, (br || "").trim(), ...COLS.slice(4).map(k => s[k])].map(q).join(","));
    kept++;
    if (s.unknown.length) console.error(`${f}: not in the index: ${s.unknown.join(" | ")}`);
  }
  fs.writeFileSync(path.join(root, "public-lists-shape.csv"), rows.join("\n") + "\n");
  console.log(`public-lists-shape.csv: ${kept} lists (${skipped.length} discarded or reference lists skipped)`);
} else if (mode === "deckshape") {
  for (const f of fs.readdirSync(root).filter(f => /^decklist-.*\.txt$/.test(f))) {
    const d = deckshape(path.join(root, f)), out = f.replace(/^decklist-/, "deckshape-").replace(/\.txt$/, ".json");
    fs.writeFileSync(path.join(root, out), JSON.stringify(d, null, 1));
    console.log(`${out}: lands ${d.totals.lands}, ramp ${d.totals.ramp}, spells ${d.totals.spells}, extra draws ~${d.totals.extra_draws_8_turns}, sinks ${d.totals.sinks}`);
  }
} else if (mode === "one") {
  const { cards } = readList(process.argv[3]); console.log(JSON.stringify(shape(cards)));
} else console.log("usage: node scripts/shape.js csv | deckshape | one <list.txt>");
