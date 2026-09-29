#!/usr/bin/env node
/* Card-by-card checks for the Miku deck in the game engine.
   node tools/sim/test-miku.js        (exits 1 on the first failed check) */
"use strict";
const path = require("path");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
require(path.join(dir, "decks-edgar.js")); // Vein Ripper, for ward
require(path.join(dir, "ai.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}

/* A 4-player table where everyone has 40 Plains in the library; cards are put where a test needs them. */
function table(n) {
  n = n || 4;
  const players = [];
  for (let i = 0; i < n; i++) players.push({ name: "P" + (i + 1), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 7, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  const [a, b, c, d] = g.players;
  return { g, a, b, c, d };
}
function put(g, p, name, opts) {
  const o = g.newObj(MK.get(name), p, "new");
  g.enterMany([{ o, controller: p, opts: opts || {} }]);
  o.sick = false;
  return o;
}
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function grave(g, p, name) { const o = g.newObj(MK.get(name), p, "graveyard"); p.graveyard.push(o); return o; }
function lands(g, p, n, name) { const out = []; for (let i = 0; i < n; i++) out.push(put(g, p, name || "Plains")); return out; }
const named = (g, p, name) => g.battlefield.filter(o => o.controller === p && o.def.name === name);

(async () => {
  // Trostani: life equal to the toughness of each creature that enters
  { const { g, a } = table(); put(g, a, "Trostani, Selesnya's Voice"); await g.settle(); a.life = 40;
    put(g, a, "Archangel of Thune"); await g.settle();
    check("Trostani gains 4 from Archangel (then Archangel counters)", a.life === 44, a.life);
    check("Archangel of Thune gets a counter from the life gain", named(g, a, "Archangel of Thune")[0].counters.p1 === 1); }

  // Cleric Class: +1 on every life gain; level 2 puts a counter; level 3 reanimates
  { const { g, a } = table(); put(g, a, "Cleric Class"); await g.settle(); a.life = 40;
    g.gainLife(a, 3); await g.settle();
    check("Cleric Class makes 3 life into 4", a.life === 44, a.life);
    const cc = named(g, a, "Cleric Class")[0];
    lands(g, a, 10); const pm = put(g, a, "Ajani's Pridemate"); await g.settle();
    await g.activate(a, cc, 301); await g.settle();
    check("Cleric Class reaches level 2", cc.state.level === 2, cc.state.level);
    g.gainLife(a, 1); await g.settle();
    check("Level 2 and Pridemate each add a counter", pm.counters.p1 === 2, pm.counters);
    grave(g, a, "Archangel of Thune");
    await g.activate(a, cc, 302); await g.settle();
    check("Level 3 returns Archangel of Thune", named(g, a, "Archangel of Thune").length === 1);
  }

  // Heliod + Walking Ballista with lifelink: the loop kills every opponent
  { const { g, a, b, c, d } = table(); lands(g, a, 8);
    for (let i = 0; i < 4; i++) put(g, a, "Plains");
    const helio = put(g, a, "Heliod, Sun-Crowned"); const bal = put(g, a, "Walking Ballista", { x: 2 }); await g.settle();
    check("Ballista enters with X counters", bal.counters.p1 === 2, bal.counters);
    await g.perform(a, { type: "activate", card: helio, idx: 0 });
    check("Heliod gives Ballista lifelink", g.kw(bal, "lifelink"));
    await g.perform(a, { type: "activate", card: bal, idx: 1, repeat: 200 });
    check("Heliod + Ballista kills all three opponents", g.over && g.winner === a, { over: g.over, lives: [b.life, c.life, d.life] });
    check("Ballista still has its counter", bal.counters.p1 >= 1, bal.counters);
  }

  // Heliod + Spike Feeder: a life loop that keeps the counter
  { const { g, a } = table(); put(g, a, "Heliod, Sun-Crowned"); const sf = put(g, a, "Spike Feeder"); await g.settle(); a.life = 40;
    await g.perform(a, { type: "activate", card: sf, idx: 1, repeat: 10 });
    check("Spike Feeder + Heliod gains 20 life in 10 loops", a.life === 60, a.life);
    check("Spike Feeder keeps its counters", sf.counters.p1 === 2, sf.counters); }

  // Halo Fountain: fifteen tapped creatures and WWWWW win the game
  { const { g, a } = table(); lands(g, a, 5); const hf = put(g, a, "Halo Fountain");
    g.createToken(a, MK.T.citizen, { count: 15 }); await g.settle();
    for (const o of g.creatures(a)) o.tapped = true;
    check("Halo Fountain win is available", g.canActivate(a, hf, g.findAbility(hf, 2)));
    await g.perform(a, { type: "activate", card: hf, idx: 2 });
    check("Halo Fountain wins the game", g.over && g.winner === a); }

  // Cathars' Crusade: three tokens at once give three counters to each creature
  { const { g, a } = table(); put(g, a, "Cathars' Crusade"); const pm = put(g, a, "Ajani's Pridemate"); await g.settle();
    pm.counters = {};
    const toks = g.createToken(a, MK.T.citizen, { count: 3 }); await g.settle();
    check("Crusade: Pridemate gets 4 counters (its own entry was earlier, 3 tokens now)", pm.counters.p1 === 3, pm.counters);
    check("Crusade: each token gets 3", toks.every(t => t.counters.p1 === 3), toks.map(t => t.counters)); }

  // Vorinclex doubles land mana; opponents' lands stay tapped
  { const { g, a, b } = table(); put(g, a, "Vorinclex, Voice of Hunger"); lands(g, a, 3, "Forest");
    const big = hand(g, a, "Craterhoof Behemoth");
    check("Vorinclex: 3 Forests pay for an 8-drop? no (6 mana)", !g.castOptions(a, big).length);
    lands(g, a, 1, "Forest");
    check("Vorinclex: 4 Forests make 8 mana", g.castOptions(a, big).length === 1); }

  // Mirror Entity and Craterhoof
  { const { g, a } = table(); lands(g, a, 6); const me = put(g, a, "Mirror Entity"); g.createToken(a, MK.T.citizen, { count: 2 }); await g.settle();
    await g.perform(a, { type: "activate", card: me, idx: 0, x: 6 });
    check("Mirror Entity makes everything 6/6", g.creatures(a).every(o => g.power(o) === 6 && g.toughness(o) === 6), g.creatures(a).map(o => g.power(o)));
    check("Mirror Entity gives all creature types", g.hasSub(g.creatures(a)[1], "Angel")); }
  { const { g, a } = table(); g.createToken(a, MK.T.citizen, { count: 3 }); lands(g, a, 8, "Forest"); const ch = hand(g, a, "Craterhoof Behemoth");
    await g.cast(a, ch);
    check("Craterhoof: 4 creatures, +4/+4", g.creatures(a).filter(o => o.isToken).every(o => g.power(o) === 5 && g.kw(o, "trample"))); }

  // Adeline and Hero of Bladehold in combat
  { const { g, a, b, c, d } = table(); const ad = put(g, a, "Adeline, Resplendent Cathar"); const hero = put(g, a, "Hero of Bladehold"); await g.settle();
    a.agent.attack = () => [{ attacker: ad, target: b }, { attacker: hero, target: b }];
    for (const q of [b, c, d]) q.agent.block = () => [];
    await g.doCombat(a);
    const humans = named(g, a, "Human"), soldiers = named(g, a, "Soldier");
    check("Adeline makes a Human per opponent", humans.length === 3, humans.length);
    check("Hero makes two Soldiers", soldiers.length === 2, soldiers.length);
    // Adeline's power = creatures (2 + 3 humans + 2 soldiers = 7); soldiers 1+1 (battle cry) each; humans 1+1 each; hero 3
    const expected = 7 + 1 + 3 + 2 * 2 + 3 * 2;
    check("Combat damage with battle cry", 120 - (b.life + c.life + d.life) === expected, { b: b.life, c: c.life, d: d.life, expected }); }

  // Ghalta and Mavren: Dinosaur mode
  { const { g, a, b, c, d } = table(); const gm = put(g, a, "Ghalta and Mavren"); const ang = put(g, a, "Archangel of Thune"); await g.settle();
    a.agent.attack = () => [{ attacker: gm, target: b }, { attacker: ang, target: c }];
    a.agent.choose = (gg, p, req) => (req.purpose === "ghaltaMode" ? 0 : MK.AI.create().choose(gg, p, req));
    for (const q of [b, c, d]) q.agent.block = () => [];
    await g.doCombat(a);
    const dino = named(g, a, "Dinosaur")[0];
    check("Ghalta makes a Dinosaur as big as the Archangel", dino && g.power(dino) >= 3, dino && g.power(dino)); }

  // Elenda's Hierophant and Voice of Resurgence die
  { const { g, a } = table(); const eh = put(g, a, "Elenda's Hierophant"); await g.settle(); g.addCounters(eh, "p1", 3); await g.settle();
    g.destroy(eh); await g.settle();
    check("Hierophant makes 4 lifelink Vampires", named(g, a, "Vampire").length === 4, named(g, a, "Vampire").length);
    const v = put(g, a, "Voice of Resurgence"); await g.settle(); g.destroy(v); await g.settle();
    const el = named(g, a, "Elemental")[0];
    check("Voice leaves an Elemental sized by creature count", el && g.power(el) === g.creatures(a).length, el && g.power(el)); }

  // Dazzling Theater gives convoke to creature spells; Prop Room untaps on other turns
  { const { g, a, b } = table(); put(g, a, "Dazzling Theater // Prop Room", { door: 0 }); g.createToken(a, MK.T.citizen, { count: 5 }); await g.settle();
    const c5 = hand(g, a, "Archangel of Thune");
    check("Convoke lets 5 tokens cast Archangel", g.castOptions(a, c5).length === 1);
    await g.cast(a, c5);
    check("Archangel resolved by convoke", named(g, a, "Archangel of Thune").length === 1 && g.creatures(a).filter(o => o.tapped).length === 5); }
  { const { g, a, b } = table(); put(g, a, "Dazzling Theater // Prop Room", { door: 1 }); const t = g.createToken(a, MK.T.citizen)[0]; t.tapped = true;
    g.activeIdx = 1; b.agent.main = () => ({ type: "pass" }); b.agent.attack = () => []; for (const q of g.players) q.agent.respond = () => null;
    await g.takeTurn(b);
    check("Prop Room untaps our creatures on another player's turn", !t.tapped); }

  // Excavation Technique with demonstrate: two permanents destroyed, treasures for both controllers
  { const { g, a, b, c } = table(); lands(g, a, 4); put(g, b, "Sol Ring"); put(g, c, "Arcane Signet");
    const et = hand(g, a, "Excavation Technique");
    a.agent.choose = (gg, p, req) => req.purpose === "demonstrate" ? true : req.purpose === "demonstrateOpponent" ? c : MK.AI.create().choose(gg, p, req);
    await g.cast(a, et);
    check("Demonstrate destroys two things", g.battlefield.filter(o => ["Sol Ring", "Arcane Signet"].includes(o.def.name)).length <= 1);
    check("Treasures made", g.battlefield.filter(o => o.def.name === "Treasure").length >= 2); }

  // Finale of Devastation with X >= 10
  { const { g, a } = table(); lands(g, a, 12, "Forest"); a.library.unshift(g.newObj(MK.get("Soul Warden"), a, "library")); const fin = hand(g, a, "Finale of Devastation");
    g.createToken(a, MK.T.citizen); await g.settle();
    await g.cast(a, fin, { x: 10 });
    check("Finale puts a creature onto the battlefield", g.creatures(a).length >= 2);
    check("Finale X=10 pumps +10/+10 with haste", g.creatures(a).some(o => g.power(o) >= 11 && g.kw(o, "haste"))); }

  // Selesnya Sanctuary returns a land; Brokers Hideout fetches
  { const { g, a } = table(); lands(g, a, 2); a.library = []; const f = g.newObj(MK.get("Forest"), a, "library"); a.library.push(f);
    const bh = put(g, a, "Brokers Hideout"); await g.settle();
    check("Brokers Hideout is sacrificed and finds a Forest", !named(g, a, "Brokers Hideout").length && named(g, a, "Forest").length === 1 && named(g, a, "Forest")[0].tapped);
    const n = g.controlled(a, o => g.isLand(o)).length;
    put(g, a, "Selesnya Sanctuary"); await g.settle();
    check("Selesnya Sanctuary returns a land", g.controlled(a, o => g.isLand(o)).length === n && a.hand.some(o => o.def.types.includes("Land"))); }

  // Skullclamp: equip a 1/1, it dies, draw two
  { const { g, a } = table(); lands(g, a, 2); const sc = put(g, a, "Skullclamp"); const tok = g.createToken(a, MK.T.citizen)[0]; await g.settle();
    const h = a.hand.length;
    await g.activate(a, sc, 600);
    check("Skullclamp kills the 1/1 and draws 2", tok.zone !== "battlefield" && a.hand.length === h + 2, { zone: tok.zone, hand: a.hand.length - h }); }

  // Lathiel distributes at end step
  { const { g, a } = table(); const la = put(g, a, "Lathiel, the Bounteous Dawn"); const pm = put(g, a, "Ajani's Pridemate"); await g.settle();
    a.gained = 0; pm.counters = {}; g.gainLife(a, 3); await g.settle();
    const before = pm.counters.p1 || 0;
    g.emit("endStep", { p: a }); await g.settle();
    check("Lathiel puts counters on others", (pm.counters.p1 || 0) > before, pm.counters); }

  // Nykthos Paragon once per turn
  { const { g, a } = table(); const np = put(g, a, "Nykthos Paragon"); await g.settle(); np.counters = {};
    g.gainLife(a, 3); await g.settle(); g.gainLife(a, 5); await g.settle();
    check("Paragon uses only the first gain", np.counters.p1 === 3, np.counters); }

  // Aetherflux Reservoir
  { const { g, a, b } = table(); put(g, a, "Aetherflux Reservoir"); lands(g, a, 3); a.life = 40;
    for (const n of ["Soul Warden", "Soul Warden", "Soul Warden"]) { const o = hand(g, a, n); await g.cast(a, o); }
    // 0 + 1 + 2 from the Reservoir (spells cast before each one), plus Soul Warden triggers (0 + 1 + 2)
    check("Aetherflux gains 0+1+2 (plus Soul Wardens)", a.life === 40 + 3 + 3, a.life); }

  // Fanatic of Rhonas: GGGG with a 4-power creature
  { const { g, a } = table(); const fr = put(g, a, "Fanatic of Rhonas"); const big = hand(g, a, "Bramble Sovereign");
    check("Fanatic alone makes 1", !g.castOptions(a, big).length);
    put(g, a, "Archangel of Thune"); g.addCounters(named(g, a, "Archangel of Thune")[0], "p1", 1);
    check("Fanatic makes GGGG with a 4-power creature", g.castOptions(a, big).length === 1); }

  // Shalai: hexproof for you and your other creatures
  { const { g, a, b } = table(); put(g, a, "Shalai, Voice of Plenty"); const pm = put(g, a, "Ajani's Pridemate"); lands(g, b, 1); const sw = hand(g, b, "Swords to Plowshares");
    const opts = g.targetOptions(b, { kind: "creature" }, sw);
    check("Shalai protects other creatures", !opts.includes(pm) && opts.some(o => o.def.name === "Shalai, Voice of Plenty"));
    check("Shalai gives the player hexproof", !g.targetOptions(b, { kind: "player" }, sw).includes(a)); }

  // Resplendent Angel and Speaker of the Heavens
  { const { g, a } = table(); put(g, a, "Resplendent Angel"); a.gained = 0; g.gainLife(a, 5); g.emit("endStep", { p: a }); await g.settle();
    check("Resplendent Angel makes a 4/4 Angel", named(g, a, "Angel").length === 1);
    const sp = put(g, a, "Speaker of the Heavens"); a.life = 47;
    check("Speaker works at 47 life", g.canActivate(a, sp, g.findAbility(sp, 0)));
    a.life = 46; check("Speaker needs 47", !g.canActivate(a, sp, g.findAbility(sp, 0))); }

  // Soul of Eternity and encore
  { const { g, a, b, c, d } = table(); const so = put(g, a, "Soul of Eternity"); a.life = 33; g.bump();
    check("Soul of Eternity is as big as your life", g.power(so) === 33 && g.toughness(so) === 33);
    g.destroy(so); await g.settle(); lands(g, a, 9);
    const soul = a.graveyard.find(o => o.def.name === "Soul of Eternity");
    await g.activate(a, soul, 700);
    const toks = named(g, a, "Soul of Eternity");
    check("Encore makes a copy per opponent that must attack", toks.length === 3 && toks.every(t => t.state.mustAttack && g.kw(t, "haste")), toks.length);
    a.agent.attack = () => [];
    for (const q of [b, c, d]) q.agent.block = () => [];
    await g.doCombat(a);
    check("Encore copies attacked their opponents", b.life <= 7 && c.life <= 7 && d.life <= 7, [b.life, c.life, d.life]); }

  // Hour of Reckoning spares tokens; Grand Crescendo saves everything
  { const { g, a, b } = table(); put(g, a, "Soul Warden"); g.createToken(a, MK.T.citizen, { count: 2 }); put(g, b, "Archangel of Thune"); lands(g, a, 7); await g.settle();
    const hr = hand(g, a, "Hour of Reckoning"); for (const q of g.players) q.agent.respond = () => null; await g.cast(a, hr);
    check("Hour of Reckoning keeps tokens", g.creatures(a).length === 2 + 1 - 1 && g.creatures(b).length === 0, g.creatures(a).map(o => o.def.name)); }
  { const { g, a } = table(); lands(g, a, 5); const gc = hand(g, a, "Grand Crescendo"); await g.cast(a, gc, { x: 3 });
    check("Grand Crescendo X=3 makes 3 Citizens with indestructible", named(g, a, "Citizen").length === 3 && named(g, a, "Citizen").every(o => g.kw(o, "indestructible"))); }

  // Beastmaster Ascension
  { const { g, a, b, c, d } = table(); const ba = put(g, a, "Beastmaster Ascension"); const toks = g.createToken(a, MK.T.citizen, { count: 7 }); await g.settle(); toks.forEach(t => t.sick = false);
    a.agent.attack = () => toks.map(t => ({ attacker: t, target: b }));
    for (const q of [b, c, d]) q.agent.block = () => [];
    await g.doCombat(a);
    check("Beastmaster Ascension reaches 7 and gives +5/+5", ba.counters.quest === 7 && b.life === 40 - 7 * 6, { quest: ba.counters.quest, life: b.life }); }

  // Lazotep Quarry: X comes from the card's mana value
  { const { g, a } = table(); lands(g, a, 7); const q = put(g, a, "Lazotep Quarry"); grave(g, a, "Archangel of Thune");
    check("Quarry can copy a 5-drop with 7 other mana", g.canActivate(a, q, g.findAbility(q, 1)));
    await g.activate(a, q, 1);
    const z = named(g, a, "Archangel of Thune")[0];
    check("Quarry makes a 4/4 black Zombie Archangel", z && g.power(z) === 4 && g.colorsOf(z).has("B") && g.kw(z, "flying")); }

  // Etb-tapped lands
  { const { g, a } = table(); const cv = put(g, a, "Canopy Vista"); check("Canopy Vista enters tapped with no basics", cv.tapped);
    lands(g, a, 2); const cv2 = put(g, a, "Sunpetal Grove"); check("Sunpetal Grove enters untapped with a Plains", !cv2.tapped);
    const rt = put(g, a, "Razorverge Thicket"); check("Razorverge Thicket is tapped with 4 other lands", rt.tapped); }

  // Path to Exile gives the controller a basic land
  { const { g, a, b } = table(); lands(g, a, 1); const pm = put(g, b, "Ajani's Pridemate"); const pa = hand(g, a, "Path to Exile");
    await g.cast(a, pa, { targets: [pm] });
    check("Path exiles and gives a land", pm.zone === "exile" && g.controlled(b, o => g.isLand(o)).length === 1); }

  // Esika's Chariot: cats, crew, copy a token when it attacks
  { const { g, a, b, c, d } = table(); lands(g, a, 4, "Forest"); const ec = hand(g, a, "Esika's Chariot"); await g.cast(a, ec);
    const cats = named(g, a, "Cat"); check("Chariot makes two Cats", cats.length === 2);
    const car = named(g, a, "Esika's Chariot")[0]; car.sick = false; cats.forEach(t => t.sick = false);
    await g.perform(a, { type: "activate", card: car, idx: 500 });
    check("Chariot is crewed", g.isCreature(car) && cats.every(t => t.tapped));
    a.agent.attack = () => [{ attacker: car, target: b }]; for (const q of [b, c, d]) q.agent.block = () => [];
    await g.doCombat(a);
    check("Chariot copies a Cat when it attacks", named(g, a, "Cat").length === 3 && b.life === 36); }

  // Auto payment taps only what the cost needs
  { const { g, a } = table(); const ls = [put(g, a, "Forest"), put(g, a, "Forest"), put(g, a, "Plains"), put(g, a, "Plains")];
    check("{1}{W}{W} is paid", g.pay(a, MK.parseCost("{1}{W}{W}")));
    check("{1}{W}{W} taps three of four lands", ls.filter(o => o.tapped).length === 3, ls.map(o => o.tapped));
    check("no mana is left floating", g.poolTotal(a) === 0, a.pool); }
  { const { g, a } = table(); const sr = put(g, a, "Sol Ring"); const ls = lands(g, a, 2, "Forest");
    g.pay(a, MK.parseCost("{2}"));
    check("{2} uses Sol Ring alone", sr.tapped && ls.every(o => !o.tapped)); }

  // A player who loses takes their own cards out of the game and gives back what they borrowed
  { const { g, a, b, c } = table(); const pm = put(g, b, "Ajani's Pridemate"); const own = put(g, a, "Ajani's Pridemate");
    pm.controller = a; g.bump();
    g.lose(a, "concede");
    check("a borrowed creature goes back to its owner", pm.zone === "battlefield" && pm.controller === b, { zone: pm.zone, ctl: pm.controller.name });
    check("the loser's own creature leaves the game", own.zone === "gone", own.zone);
    check("the game goes on with three players", !g.over && !b.lost && !c.lost); }
  { const { g, a, b } = table(); const eq = put(g, b, "Skullclamp"); const own = put(g, a, "Ajani's Pridemate");
    eq.attachedTo = own; g.bump();
    g.lose(a, "concede");
    check("Equipment falls off a creature that left with its owner", eq.zone === "battlefield" && eq.attachedTo === null); }

  // Trostani checks each token after the other triggers have grown it (the guide's calculator)
  const citizen = MK.tokenDef({ key: "test-citizen", name: "Citizen", pt: [1, 1], colors: "GW", subtypes: ["Citizen"] });
  async function tokenGain(names, n) {
    const { g, a } = table();
    for (const nm of names) put(g, a, nm);
    await g.settle(); a.life = 40;
    g.createToken(a, citizen, { count: n }); await g.settle();
    return a.life - 40;
  }
  { const got = await tokenGain(["Trostani, Selesnya's Voice", "Soul Warden", "Archangel of Thune"], 2);
    check("Trostani + Soul Warden + Thune, two tokens: +9", got === 9, got); }
  { const got = await tokenGain(["Trostani, Selesnya's Voice", "Cathars' Crusade"], 1);
    check("Trostani sees Cathars' Crusade's counter: +2", got === 2, got); }
  { const got = await tokenGain(["Trostani, Selesnya's Voice", "Soul Warden", "Archangel of Thune", "Cathars' Crusade"], 2);
    check("Trostani + Warden + Thune + Crusade, two tokens: +13", got === 13, got); }
  { const got = await tokenGain(["Trostani, Selesnya's Voice", "Heliod, Sun-Crowned", "Soul Warden"], 2);
    check("Heliod's counters go on the token Trostani checks next: +7", got === 7, got); }

  // removal whose target is gone does nothing, and the table is told (the card leaves the spotlight)
  { const { g, a, b } = table(); lands(g, a, 1); const pm = put(g, b, "Ajani's Pridemate"); const sw = hand(g, a, "Swords to Plowshares");
    const anims = []; g.ui = { anim: k => anims.push(k) };
    g.opts.strict = false;
    const realSettle = g.settle.bind(g);
    let once = false;
    g.settle = async function () { if (!once && g.stack.length) { once = true; g.moveTo(pm, "graveyard"); } return realSettle(); };
    await g.cast(a, sw, { targets: [pm] });
    check("Swords with its target gone fizzles", anims.includes("fizzle") && !anims.includes("resolve") && sw.zone === "graveyard", anims); }

  // a spell countered by ward while another spell waits below it: that spell isn't resolved early
  { const { g, a, b } = table(); lands(g, a, 1); const vr = put(g, b, "Vein Ripper"); const sw = hand(g, a, "Swords to Plowshares");
    const below = g.newObj(MK.get("Grand Crescendo"), b, "stack");
    g.stack.push({ kind: "spell", o: below, p: b, x: 0, door: 0, alt: 0, targets: [], mode: null, id: ++g.ts, name: "Grand Crescendo" });
    await g.cast(a, sw, { targets: [vr] });
    check("Ward counters Swords (no creature to sacrifice)", sw.zone === "graveyard" && vr.zone === "battlefield", { sw: sw.zone, vr: vr.zone });
    check("The spell below is still waiting for its own round", g.stack.length === 1 && g.stack[0].o === below, g.stack.map(it => it.name)); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
