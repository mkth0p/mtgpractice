#!/usr/bin/env node
/* Checks the Corrupted Etrata deck (decks-cetrata.js) in the game engine: the list, its win lines
   (vampire loop, Mindcrank + Guildmage, Bloodletter + Virtus, the Brine lock with Vesuvan), transmute,
   the theft cards, the coach and a few bot games.
   node tools/sim/test-cetrata.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}
function table(n) {
  const players = [{ name: "Etrata", commander: "Etrata, Deadly Fugitive", list: Array(99).fill("Island"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < (n || 3); i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lib(g, p, name) { const o = g.newObj(MK.get(name), p, "library"); p.library.unshift(o); return o; }
function lands(g, p, n) { for (let i = 0; i < n; i++) put(g, p, i % 2 ? "Island" : "Swamp"); }
async function attack(g, a, list) { a.agent.attack = () => list; await g.doCombat(a); await g.settle(); }
const opps = (g, a) => g.players.filter(q => q !== a);

(async () => {
  const deck = MK.CETRATA_DECK;
  check("deck: 99 cards", deck.list.length === 99, deck.list.length);
  check("deck: every card is defined", deck.list.every(n => MK.defs.has(n)), deck.list.filter(n => !MK.defs.has(n)));
  const singles = deck.list.filter(n => !/^(Island|Swamp)$/.test(n));
  check("deck: singleton", new Set(singles).size === singles.length);
  check("deck: 8 Island + 8 Swamp", deck.list.filter(n => n === "Island").length === 8 && deck.list.filter(n => n === "Swamp").length === 8);
  check("deck: a hero deck offered on the Etrata site too", MK.HERO_DECKS.includes(deck) && deck.alsoOn.includes("etrata") && deck.hero === "corrupted-etrata");
  check("deck: identity fits", deck.list.every(n => MK.get(n).colors.every(k => k === "U" || k === "B")));
  check("checklist exists under the coach's key", (globalThis.MK_CHECKLISTS[deck.coach.checklist] || []).length >= 6);
  // the decklist file matches, when it's here
  const src = "/mnt/project-files/etrata-deck/b4-shadow-market/decklist.txt";
  if (fs.existsSync(src)) {
    const want = [];
    for (const line of fs.readFileSync(src, "utf8").trim().split("\n")) { const m = line.match(/^(\d+) (.+)$/); if (m) for (let i = 0; i < +m[1]; i++) want.push(m[2].trim()); }
    const ours = ["Etrata, Deadly Fugitive"].concat(deck.list).sort(), theirs = want.sort();
    check("deck matches decklist.txt", JSON.stringify(ours) === JSON.stringify(theirs), theirs.filter(n => !ours.includes(n)).concat(ours.filter(n => !theirs.includes(n))));
  }

  // Vampire loop: Exquisite Blood + Marauding Blight-Priest kills a table at 40 life from one point of life loss
  for (const [x, y] of [["Exquisite Blood", "Marauding Blight-Priest"], ["Bloodthirsty Conqueror", "Marauding Blight-Priest"], ["Exquisite Blood", "Vito, Thorn of the Dusk Rose"], ["Exquisite Blood", "Sanguine Bond"]]) {
    const { g, a, b } = table(); put(g, a, x); put(g, a, y); await g.settle();
    g.loseLife(b, 1, null); await g.settle();
    check(`vampire loop ${x} + ${y} kills the table`, g.over && g.winner === a && opps(g, a).every(q => q.lost), opps(g, a).map(q => q.life));
  }
  // and from an Assassin's hit
  { const { g, a, b } = table(); put(g, a, "Exquisite Blood"); put(g, a, "Marauding Blight-Priest"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("vampire loop starts on a combat hit", g.over && g.winner === a); }

  // Mindcrank + Duskmantle Guildmage kills one opponent
  { const { g, a, b, c } = table(); lands(g, a, 8); put(g, a, "Mindcrank"); const gm = put(g, a, "Duskmantle Guildmage"); await g.settle();
    b.life = 40; b.library.length = 60;
    await g.activate(a, gm, 0, {}); await g.settle();
    await g.activate(a, gm, 1, { targets: [b] }); await g.settle();
    check("Mindcrank + Guildmage: the target loses", b.lost, { life: b.life, lib: b.library.length });
    check("Mindcrank + Guildmage: the others are fine", !c.lost); }

  // Bloodletter of Aclazotz doubles life loss on your turn only; with Virtus a hit takes everything
  { const { g, a, b } = table(); put(g, a, "Bloodletter of Aclazotz"); await g.settle();
    g.loseLife(b, 3, null); await g.settle();
    check("Bloodletter doubles on your turn", b.life === 34, b.life);
    g.activeIdx = 1; g.loseLife(b, 3, null); await g.settle();
    check("Bloodletter doesn't double on their turn", b.life === 31, b.life); }
  { const { g, a, b } = table(); put(g, a, "Bloodletter of Aclazotz"); const v = put(g, a, "Virtus the Veiled"); await g.settle(); b.life = 40;
    await attack(g, a, [{ attacker: v, target: b }]);
    check("Bloodletter + Virtus: one hit kills from 40", b.lost, b.life); }

  // Tetsuko: power or toughness 1 or less can't be blocked, checked with Ramses's pump
  { const { g, a, b } = table(); put(g, a, "Tetsuko Umezawa, Fugitive"); const v = put(g, a, "Virtus the Veiled"); const wall = put(g, b, "Llanowar Elves"); await g.settle();
    await g.emit("beginCombat", { p: a }); await g.settle();
    check("Tetsuko: Virtus (1/1) can't be blocked", !g.canBlock(wall, v)); }
  { const { g, a, b } = table(); put(g, a, "Tetsuko Umezawa, Fugitive"); put(g, a, "Ramses, Assassin Lord"); const v = put(g, a, "Virtus the Veiled"); const wall = put(g, b, "Llanowar Elves"); await g.settle();
    await g.emit("beginCombat", { p: a }); await g.settle();
    check("Tetsuko: Virtus is 2/2 under Ramses and can be blocked", g.power(v) === 2 && g.canBlock(wall, v), g.power(v)); }

  // Brine Elemental: turned face up, each opponent's permanents skip their next untap
  { const { g, a, b } = table(); lands(g, a, 4); put(g, a, "Etrata, Deadly Fugitive"); const br = hand(g, a, "Brine Elemental"); await g.settle();
    check("Brine can be cast face down", g.castOptions(a, br).some(w => w.faceDown));
    g.putFaceDown(a, [br], { kind: "morph" }); await g.settle();
    const bl = put(g, b, "Forest"); bl.tapped = true;
    const e = g.abilitiesOf(br).find(x => x.ab.etrata);
    check("Etrata grants her flip to the face-down Brine", !!e);
    await g.activate(a, br, e.i, {}); await g.settle();
    check("Brine is face up", !br.faceDown && br.def.name === "Brine Elemental");
    g.activeIdx = 1; g.turn++; await g.takeTurn(b);
    check("Brine: the opponent's land stays tapped through their untap step", bl.tapped);
    g.turn++; await g.takeTurn(b);
    check("Brine: only the next untap step is skipped", !bl.tapped); }

  // Vesuvan Shapeshifter: turned face up as a copy of Brine, Brine's trigger happens; upkeep turns it face down
  { const { g, a, b } = table(); lands(g, a, 4); put(g, a, "Brine Elemental"); const ves = hand(g, a, "Vesuvan Shapeshifter"); await g.settle();
    g.putFaceDown(a, [ves], { kind: "morph" }); await g.settle();
    const bl = put(g, b, "Forest"); bl.tapped = true;
    const up = g.abilitiesOf(ves).find(x => x.ab.faceUp && /morph/.test(x.ab.label));
    await g.activate(a, ves, up.i, {}); await g.settle();
    check("Vesuvan turns face up as Brine and survives", ves.zone === "battlefield" && ves.def.name === "Brine Elemental" && g.power(ves) === 5, { zone: ves.zone, name: ves.def.name });
    check("Vesuvan as Brine: opponents skip their untap", bl.skipUntap === true);
    a.agent.confirm = () => true;
    g.emit("upkeep", { p: a }); await g.settle();
    check("Vesuvan turns itself face down at your upkeep", !!ves.faceDown); }
  // Vesuvan with nothing to copy is a 0/0
  { const { g, a } = table(); lands(g, a, 4); const ves = hand(g, a, "Vesuvan Shapeshifter"); await g.settle();
    g.putFaceDown(a, [ves], { kind: "morph" }); await g.settle();
    const up = g.abilitiesOf(ves).find(x => x.ab.faceUp && /morph/.test(x.ab.label));
    await g.activate(a, ves, up.i, {}); await g.settle();
    check("Vesuvan with nothing to copy dies as a 0/0", ves.zone === "graveyard", ves.zone); }

  // Transmute: sorcery speed only, finds a card with the same mana value
  { const { g, a } = table(); lands(g, a, 4); const dz = hand(g, a, "Shred Memory"); const mc = lib(g, a, "Mindcrank"); lib(g, a, "Grim Tutor");
    a.agent.choose = (g2, p, req) => req.type === "cards" ? req.options.filter(o => o.def.name === "Mindcrank").slice(0, 1) : req.type === "target" || req.type === "player" ? req.options[0] : true;
    check("transmute offered in the main phase", g.canChannel(a, dz));
    g.phase = "end"; check("transmute not offered outside sorcery timing", !g.canChannel(a, dz)); g.phase = "main1";
    await g.channel(a, dz); await g.settle();
    check("Shred Memory transmutes into Mindcrank (MV 2)", mc.zone === "hand" && dz.zone === "graveyard", { mc: mc.zone, dz: dz.zone }); }
  { const { g, a } = table(); lands(g, a, 4); const dg = hand(g, a, "Dimir House Guard"); const bl = lib(g, a, "Bloodletter of Aclazotz"); lib(g, a, "Grim Tutor"); a.agent = MK.AI.create({ skill: 1 }); a.commanders = a.commanders; await g.settle();
    let opts = null; const orig = a.agent.choose; a.agent.choose = (g2, p, req) => { if (req.type === "cards" && req.purpose === "tutor") opts = req.options.map(o => o.def.mv); return orig(g2, p, req); };
    await g.channel(a, dg); await g.settle();
    check("Dimir House Guard only offers MV 4 cards", !!opts && opts.every(m => m === 4), opts);
    check("Dimir House Guard finds Bloodletter", bl.zone === "hand", bl.zone); }

  // Mox Amber makes the colors of your legendary creatures
  { const { g, a } = table(); const mox = put(g, a, "Mox Amber"); await g.settle();
    check("Mox Amber makes nothing alone", !g.canPay(a, MK.parseCost("{U}")));
    put(g, a, "Etrata, Deadly Fugitive"); await g.settle();
    check("Mox Amber makes U or B with Etrata", g.canPay(a, MK.parseCost("{U}")) && g.canPay(a, MK.parseCost("{B}")) && !!mox); }

  // Necropotence: no draw-step card, life for cards at the end step, discards exiled
  { const { g, a } = table(); put(g, a, "Necropotence"); await g.settle();
    const h0 = a.hand.length; g.phase = "draw"; g.draw(a, 1); await g.settle(); g.phase = "main1";
    check("Necropotence: the draw-step card goes back", a.hand.length === h0);
    const necro = g.battlefield.find(o => o.def.name === "Necropotence");
    const life = a.life; await g.activate(a, necro, 0, {}); await g.activate(a, necro, 0, {}); await g.settle();
    check("Necropotence: 2 life for 2 exiled cards", a.life === life - 2 && a.exile.length === 2);
    g.emit("endStep", { p: a }); g.runDelayed("endStep", a); await g.settle();
    check("Necropotence: they arrive at the end step", a.hand.length === h0 + 2 && a.exile.length === 0, { hand: a.hand.length, exile: a.exile.length });
    const c = a.hand[0]; g.discard(a, c); await g.settle();
    check("Necropotence: a discarded card is exiled", c.zone === "exile"); }

  // Notion Thief + Windfall: opponents' new hands come to you
  { const { g, a, b, c, d } = table(); lands(g, a, 3); put(g, a, "Notion Thief"); const wf = hand(g, a, "Windfall"); a.hand.push(...[]);
    for (const q of [b, c, d]) for (let i = 0; i < 4; i++) hand(g, q, "Forest");
    await g.settle(); const lib0 = a.library.length;
    await g.cast(a, wf, {}); await g.settle();
    check("Windfall + Notion Thief: opponents end with no cards", [b, c, d].every(q => q.hand.length === 0), [b, c, d].map(q => q.hand.length));
    check("Windfall + Notion Thief: you draw 4 + 12", a.hand.length === 16 && a.library.length === lib0 - 16, a.hand.length); }
  // their first draw-step card is theirs
  { const { g, a, b } = table(); put(g, a, "Notion Thief"); await g.settle();
    g.activeIdx = 1; g.phase = "draw"; g.draw(b, 1); await g.settle(); g.draw(b, 1); await g.settle();
    check("Notion Thief: the first draw-step card stays, the second is stolen", b.hand.length === 1 && a.hand.length === 1, [b.hand.length, a.hand.length]); }

  // Opposition Agent takes what an opponent tutors (Wishclaw Talisman passed to them)
  { const { g, a, b } = table(); lands(g, a, 4); put(g, a, "Opposition Agent"); const claw = put(g, a, "Wishclaw Talisman"); await g.settle();
    check("Wishclaw enters with three wish counters", claw.counters.wish === 3);
    lib(g, a, "Mindcrank");
    await g.activate(a, claw, 0, {}); await g.settle();
    check("Wishclaw: you tutor, an opponent gets it", claw.controller !== a && a.hand.some(o => o.def.name !== "Island") && claw.counters.wish === 2);
    const q = claw.controller; lands(g, q, 2); lib(g, q, "Llanowar Elves");
    g.activeIdx = q.idx; claw.tapped = false;   // it untaps in their untap step
    const ok = await g.activate(q, claw, 0, {}); await g.settle();
    if (!ok) console.log("wishclaw activate failed", g.active && g.active.name, q.name, claw.tapped, g.canPay(q, MK.parseCost("{1}")));
    const stolen = q.exile.find(o => o.playable && o.playable.by === a);
    check("Opposition Agent exiles their find for you", !!stolen, q.exile.map(o => o.def.name));
    check("Wishclaw comes back to an opponent of theirs", claw.controller !== q); }

  // Gonti: a hit exiles their top card for the attacker's controller; casting it makes a Treasure
  { const { g, a, b } = table(); put(g, a, "Gonti, Night Minister"); const oc = put(g, a, "Changeling Outcast"); lands(g, a, 3); await g.settle();
    lib(g, b, "Counterspell");
    await attack(g, a, [{ attacker: oc, target: b }]);
    const c = b.exile.find(o => o.def.name === "Counterspell");
    check("Gonti exiles their top card, playable by you", !!c && c.playable && c.playable.by === a); }
  { const { g, a, b } = table(); put(g, a, "Gonti, Night Minister"); lands(g, a, 3); const c = g.newObj(MK.get("Night's Whisper"), b, "exile"); b.exile.push(c); c.playable = { by: a, forever: true }; await g.settle();
    g.phase = "main1"; await g.cast(a, c, {}); await g.settle();
    check("Gonti: casting a card you don't own makes a Treasure", g.controlled(a, o => o.def.name === "Treasure").length === 1); }

  // Thief of Sanity and Fallen Shinobi
  { const { g, a, b } = table(); const th = put(g, a, "Thief of Sanity"); await g.settle(); ["Forest", "Llanowar Elves", "Night's Whisper"].forEach(n => lib(g, b, n));
    await attack(g, a, [{ attacker: th, target: b }]);
    check("Thief of Sanity: one exiled for you, two in their graveyard", b.exile.filter(o => o.playable && o.playable.by === a).length === 1 && b.graveyard.length === 2, { ex: b.exile.map(o => o.def.name), gy: b.graveyard.length }); }
  { const { g, a, b } = table(); lands(g, a, 4); const oc = put(g, a, "Changeling Outcast"); const fs2 = hand(g, a, "Fallen Shinobi"); await g.settle();
    lib(g, b, "Night's Whisper"); lib(g, b, "Forest");
    a.agent.respond = (g2, p, ctx) => (ctx.window === "combat" && g2.canChannel(p, fs2) ? { type: "channel", card: fs2 } : null);
    a.agent.attack = () => [{ attacker: oc, target: b }];
    await g.doCombat(a); await g.settle();
    check("Ninjutsu: Fallen Shinobi swaps in for the unblocked Outcast", fs2.zone === "battlefield" && oc.zone === "hand", { fs: fs2.zone, oc: oc.zone });
    check("Fallen Shinobi: their top two are exiled, free to play this turn", b.exile.filter(o => o.playable && o.playable.free && o.playable.by === a).length === 2 && b.life === 35, b.life); }

  // Praetor's Grasp, Grim Tutor, Culling the Weak, Black Market Connections, lands
  { const { g, a, b } = table(); lands(g, a, 3); const pg = hand(g, a, "Praetor's Grasp"); await g.settle();
    await g.cast(a, pg, { targets: [b] }); await g.settle();
    check("Praetor's Grasp: one of their cards, exiled and yours to play", b.exile.length === 1 && b.exile[0].playable.by === a); }
  { const { g, a } = table(); const cw = hand(g, a, "Culling the Weak"); put(g, a, "Swamp"); put(g, a, "Changeling Outcast"); await g.settle();
    await g.cast(a, cw, {}); await g.settle();
    check("Culling the Weak: sacrifice a creature, add BBBB", a.pool.B === 4 && g.creatures(a).length === 0, a.pool); }
  { const { g, a } = table(); put(g, a, "Black Market Connections"); a.agent.confirm = () => true; await g.settle(); const life = a.life, h = a.hand.length;
    g.emit("precombatMain", { p: a }); await g.settle();
    check("Black Market Connections: all three modes", a.life === life - 6 && a.hand.length === h + 1 && g.controlled(a, o => o.def.name === "Treasure").length === 1 && g.creatures(a).some(o => o.isToken && g.hasSub(o, "Assassin"))); }
  { const { g, a } = table(); const v = put(g, a, "Gloomlake Verge"); await g.settle();
    check("Gloomlake Verge: no B alone", !g.canPay(a, MK.parseCost("{B}")) && g.canPay(a, MK.parseCost("{U}")));
    put(g, a, "Island"); v.tapped = false; await g.settle();
    check("Gloomlake Verge: B with an Island", g.canPay(a, MK.parseCost("{B}{U}"))); }
  { const { g, a } = table(); const mp = put(g, a, "Morphic Pool");
    check("Morphic Pool enters untapped with 3 opponents", !mp.tapped); }

  // Crystal Shard: opponents pay {1} or the creature goes back
  { const { g, a, b } = table(); lands(g, a, 2); const sh = put(g, a, "Crystal Shard"); const elf = put(g, b, "Hired Poisoner"); await g.settle();
    await g.activate(a, sh, 1, { targets: [elf] }); await g.settle();
    check("Crystal Shard: an opponent without mana can't pay", elf.zone === "hand", elf.zone); }

  // Bloodletter + the Guildmage's mill with Mindcrank: the drain doubles
  // The turn planner and the companion
  { const { g, a } = table(); put(g, a, "Exquisite Blood"); put(g, a, "Vito, Thorn of the Dusk Rose"); for (let i = 0; i < 4; i++) put(g, a, i % 2 ? "Island" : "Swamp"); await g.settle();
    const r = deck.coach.plan(g, a);
    check("plan: the vampire loop is live now", r && r.lines[0] && r.lines[0].key === "vampire" && r.lines[0].when === "now", r && r.lines.map(l => l.key + ":" + l.when));
    const c = deck.coach.companion(g, a, { mode: "main" });
    check("companion: go off with the vampire loop", c && c.stage === "Go off" && c.urgent, c && c.title); }
  { const { g, a } = table(); put(g, a, "Mindcrank"); hand(g, a, "Shred Memory"); put(g, a, "Island"); await g.settle();
    const r = deck.coach.plan(g, a), l = r.lines.find(x => x.key === "mindcrank");
    check("plan: Shred Memory transmutes for the missing Guildmage", l && l.tutors.includes("Shred Memory") && l.when !== "now", l); }
  { const { g, a, b } = table(); put(g, a, "Mindcrank"); put(g, a, "Duskmantle Guildmage"); put(g, b, "Linvala, Keeper of Silence"); await g.settle();
    const l = deck.coach.plan(g, a).lines.find(x => x.key === "mindcrank");
    check("plan: Linvala blocks Mindcrank", l && l.when === "blocked" && l.blockedBy[0].name === "Linvala, Keeper of Silence", l && l.when); }
  { const { g, a } = table(); const h = ["Island", "Swamp", "Watery Grave", "Sol Ring", "Demonic Tutor", "Exquisite Blood", "Ponder"].map(n => hand(g, a, n));
    const c = deck.coach.companion(g, a, { mode: "mulligan", hand: h });
    check("companion: a keep with lands, a rock, a tutor and a piece", c && c.keep === true, c && c.title);
    const c2 = deck.coach.companion(g, a, { mode: "mulligan", hand: ["Ponder", "Brainstorm", "Counterspell", "Swan Song", "Island", "Demonic Tutor", "Night's Whisper"].map(n => ({ def: MK.get(n) })) });
    check("companion: one land is a mulligan", c2 && c2.keep === false, c2 && c2.title); }
  { const { g, a, b } = table(); put(g, a, "Etrata, Deadly Fugitive"); const v = put(g, a, "Vito, Thorn of the Dusk Rose");
    const top = { o: { def: MK.get("Toxic Deluge") }, p: b, name: "Toxic Deluge", targets: [] };
    const c = deck.coach.companion(g, a, { mode: "respond", window: "stack", top, can: ["Counterspell"] });
    check("companion: counter a board wipe", c && c.urgent && /Counterspell/.test(c.steps[0].text), c); }
  // The coach
  { const { g, a } = table(); put(g, a, "Exquisite Blood"); hand(g, a, "Drift of Phantasms"); hand(g, a, "Demonic Tutor"); await g.settle();
    const tips = deck.coach.tips(g, a);
    const t = tips.find(x => /One card from Vampire loop/.test(x.title));
    check("coach: one card from the vampire loop, with the tutors that find it", !!t && /Demonic Tutor/.test(t.text) && /Drift of Phantasms/.test(t.text), tips.map(x => x.title)); }
  { const { g, a } = table(); put(g, a, "Exquisite Blood"); put(g, a, "Sanguine Bond"); put(g, a, "Wishclaw Talisman"); await g.settle();
    const tips = deck.coach.tips(g, a);
    check("coach: vampire loop live is a win tip, first", tips[0] && tips[0].level === "win", tips.map(x => x.title));
    check("coach: Wishclaw warning", tips.some(x => x.level === "warn" && /Wishclaw/.test(x.title))); }
  { const { g, a } = table(); put(g, a, "Bloodletter of Aclazotz"); put(g, a, "Virtus the Veiled"); put(g, a, "Ramses, Assassin Lord"); await g.settle();
    const t = deck.coach.tips(g, a).find(x => x.title === "Bloodletter + Virtus");
    check("coach: Ramses makes Virtus 2/2, so Rogue's Passage", !!t && /Rogue's Passage/.test(t.text), t && t.text); }
  { const { g, a } = table(); lands(g, a, 4); put(g, a, "Etrata, Deadly Fugitive"); const br = hand(g, a, "Brine Elemental"); g.putFaceDown(a, [br], { kind: "morph" }); await g.settle();
    check("coach: flip Brine with Etrata", deck.coach.tips(g, a).some(x => /Flip Brine/.test(x.title))); }

  // The planner counts colors, not just mana: seven colorless-or-white mana can't start Mindcrank ({3}{U}{U}{B}{B})
  for (const [label, src] of [["Plains and rocks", ["Plains", "Plains", "Plains", "Plains", "Sol Ring", "Mind Stone"]], ["Islands and Swamps", ["Island", "Swamp", "Island", "Swamp", "Sol Ring", "Mind Stone"]]]) {
    const { g, a } = table(); for (const n of src) put(g, a, n); put(g, a, "Mindcrank"); put(g, a, "Duskmantle Guildmage"); await g.settle();
    g.v = (g.v || 0) + 1;
    const l = MK.CETRATA_AI.plan(g, a).lines.find(x => x.key === "mindcrank");
    const want = label === "Islands and Swamps" ? "now" : "later";
    check(`planner: Mindcrank with ${label} is ${want}`, !!l && l.when === want, l && { when: l.when, cost: l.cost, colorShort: l.colorShort });
  }

  // Bot games: no engine errors, the deck wins some
  { let errors = 0, wins = 0;
    const opp = MK.BOT_DECKS.filter(d => d.bracket === 4 && d.id !== deck.id);
    for (let i = 0; i < 8; i++) {
      const seats = [deck, opp[i % opp.length], opp[(i + 1) % opp.length], opp[(i + 2) % opp.length]];
      const g = new MK.Game({ seed: 200 + i, players: seats.map((d, k) => ({ name: d.name + k, commander: d.commander, list: d.list, identity: d.identity, agent: MK.AI.create({ skill: .85, aggression: d.aggression }) })), maxTurns: 60, ui: { anim() {}, log() {} } });
      g.warn = (e) => { errors++; console.log("warn", e && e.message); };
      try { await g.play(); } catch (e) { errors++; console.log(e); }
      if (g.winner === g.players[0]) wins++;
      try { deck.coach.tips(g, g.players[0]); deck.coach.plan(g, g.players[0]); deck.coach.companion(g, g.players[0], { mode: "main" }); } catch (e) { errors++; console.log("coach", e); }
    }
    check("eight bot games without engine errors", errors === 0, errors);
    console.log(`bot games: Corrupted Etrata won ${wins} of 8`);
  }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
