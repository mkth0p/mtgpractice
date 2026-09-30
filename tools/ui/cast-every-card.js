#!/usr/bin/env node
/* Casts every nonland card of a deck you can pilot through the real game screen, then taps each
   ability it offers, answering every question like a person would. Opponents stay passive.
   Reports page errors, "Display error" log lines, cards that glow but can't be cast, casts that do
   nothing, questions with no way out, and plays after which the table never comes back to you.
   node tools/ui/cast-every-card.js --hero miku-precon [--site miku] [--only "Swords to Plowshares|Heliod, Sun-Crowned"] [--verbose]
   Exits 1 when something is reported. */
"use strict";
const { serve, launch, openPlay, rng, answer, passiveOpponents } = require("./serve");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const HERO = opt("hero", "miku"), SITE = opt("site", "miku"), ONLY = opt("only", null), VERBOSE = !!opt("verbose", false);
const rnd = rng(+opt("seed", 3));
const issues = [];
let cur = "setup";
const note = (kind, msg, extra) => { const s = `${cur}: ${kind}: ${msg}`; issues.push(s); console.log("  " + s); if (extra) console.log("     ", JSON.stringify(extra).slice(0, 600)); };

(async () => {
  const srv = await serve();
  const browser = await launch();
  const { page } = await openPlay(browser, srv, { site: SITE, hero: HERO }, (k, m) => note(k, m));
  await passiveOpponents(page);
  const state = () => page.evaluate(() => { const t = MikuGame.Lobby.table, g = t.g; return { mode: t.mode, sheet: t.sheetMode, on: !!document.querySelector(".mg-sheet.on"), mull: !!document.querySelector(".mg-mull"), over: g.over, phase: g.phase, mine: g.active === t.me, stack: g.stack.length }; });
  // play along until it's our first main phase
  for (let i = 0; i < 3000; i++) {
    const st = await state();
    if (st.over) { console.log("The game ended before our first turn."); process.exit(1); }
    if (st.mull) { await page.click(".btns [data-m='1']"); continue; }
    if (st.on && st.sheet === "prompt") { await answer(page, rnd); continue; }
    if (st.mode === "main" && st.mine && st.phase === "main1") break;
    const act = { main: "pass", attack: "atkgo", block: "blkgo", respond: "rpass", wait: "ff" }[st.mode];
    if (act) await page.click(`[data-act='${act}']`).catch(() => {});
    await page.waitForTimeout(40);
  }
  // back to our main phase after a play, answering questions on the way
  const settle = async ms => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const st = await state();
      if (st.over) return "over";
      if (st.on && st.sheet === "prompt") { try { await answer(page, rnd); } catch (e) { note("question", e.message); await page.evaluate(() => MikuGame.Lobby.table.closeSheet("answered")); } continue; }
      if (st.mode === "main" && !st.stack) return "main";
      const act = { respond: "rpass", attack: "atkgo", block: "blkgo" }[st.mode];
      if (act) await page.click(`[data-act='${act}']`).catch(() => {});
      await page.waitForTimeout(40);
    }
    return "stuck";
  };
  const names = await page.evaluate(only => {
    const t = MikuGame.Lobby.table;
    const d = MK.HERO_DECKS.find(x => x.id === t.me.deckId) || MK.MIKU_DECK;
    const useful = n => { const c = MK.get(n); return !c.types.includes("Land") || c.abilities.length || c.triggers.length; };
    return only ? String(only).split("|") : [...new Set(d.list.concat([d.commander]))].filter(useful);
  }, ONLY);
  console.log(`${HERO}: ${names.length} cards`);
  for (const name of names) {
    cur = name;
    // a fresh board: 16 lands, three creatures and a token of ours, a creature and some artifacts
    // and enchantments of theirs, creature cards in our graveyard, and the card in hand
    const setup = await page.evaluate(name => {
      const t = MikuGame.Lobby.table, g = t.g, me = t.me;
      if (g.over) return "over";
      for (const o of g.battlefield.slice()) if (o.controller === me) { g.removeFromZone(o); o.zone = "exile"; me.exile.push(o); }
      me.hand.length = 0; me.life = 40; me.landsPlayed = 0;
      const put = (p, n) => { const o = g.newObj(MK.get(n), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; o.tapped = false; return o; };
      const basics = (me.identity || ["G", "W"]).map(k => ({ W: "Plains", U: "Island", B: "Swamp", R: "Mountain", G: "Forest" })[k]).filter(n => n && MK.defs.has(n));
      for (let i = 0; i < 16; i++) put(me, basics[i % basics.length] || "Plains");
      ["Llanowar Elves", "Soul Warden", "Ajani's Pridemate"].forEach(n => put(me, n));
      if (!g.battlefield.some(o => o.controller !== me && g.isCreature(o))) for (const q of g.players) if (q !== me && !q.lost) put(q, "Llanowar Elves");
      if (!g.battlefield.some(o => o.controller !== me && (g.isArtifact(o) || g.isEnchantment(o)))) { const q = g.players.find(x => x !== me && !x.lost); put(q, "Sol Ring"); put(q, "Intangible Virtue"); }
      for (const n of ["Archangel of Thune", "Llanowar Elves", "Hero of Bladehold"]) { const o = g.newObj(MK.get(n), me, "graveyard"); me.graveyard.push(o); }
      g.createToken(me, MK.T.soldier);
      let o = me.commanders.find(c => c.def.name === name);
      if (o && o.zone !== "command") return "commander not in the command zone";
      if (!o) { o = g.newObj(MK.get(name), me, "hand"); me.hand.push(o); }
      g.settle();
      t.canCache = null; t.render();
      return "ok:" + o.id;
    }, name);
    if (setup === "over") { note("game over", "the game ended during the test"); break; }
    if (!setup.startsWith("ok:")) { note("setup", setup); continue; }
    if ((await settle(15000)) !== "main") { note("setup", "the board never settled"); continue; }
    const oid = +setup.slice(3);
    let onField = false;
    {
      const el = await page.$(`.mg-hand [data-oid="${oid}"], .mg-cmd[data-oid="${oid}"]`);
      if (!el) { note("not on screen", "the card isn't in the hand or command zone"); continue; }
      const glows = await el.evaluate(e => e.classList.contains("can"));
      await el.click();
      await page.waitForTimeout(60);
      const btns = await page.$$(".mg-sheet.on .use:not([disabled])");
      // counterspells need a spell to aim at
      const needsSpell = await page.evaluate(n => { const d = MK.get(n); return [].concat((d.spell && d.spell.targets) || [], ...(d.modes || []).map(m => m.targets || [])).some(t => t.kind === "spell"); }, name);
      if (!btns.length && needsSpell) { await page.evaluate(() => MikuGame.Lobby.table.closeSheet()); if (VERBOSE) console.log(`  ${name}: skipped (needs a spell to target)`); continue; }
      if (!btns.length) {
        const labels = await page.$$eval(".mg-sheet.on .use", bs => bs.map(b => b.innerText.replace(/\s+/g, " ")));
        note(glows ? "glows but can't be cast" : "can't be cast", labels.join(" | "));
        await page.evaluate(() => MikuGame.Lobby.table.closeSheet());
        continue;
      }
      const lb = await page.evaluate(() => MikuGame.Lobby.table.g.logs.length);
      await btns[0].click();
      const r = await settle(15000);
      const after = await page.evaluate(([id, lb]) => { const t = MikuGame.Lobby.table, g = t.g; const all = g.battlefield.concat(...g.players.map(p => [...p.hand, ...p.graveyard, ...p.exile, ...p.command, ...p.library])); const o = all.find(x => x.id === id); return { zone: o ? o.zone : "gone", logs: g.logs.slice(lb).map(e => e.text).filter(s => !/\(Soul Warden\)/.test(s)).slice(-10) }; }, [oid, lb]);
      if (r !== "main") note("never came back", r, after.logs);
      if ((after.zone === "hand" || after.zone === "command") && !after.logs.some(l => / (casts|plays) /.test(l))) note("cast did nothing", after.zone, after.logs);
      if (VERBOSE) console.log(`  ${name} -> ${after.zone}: ${after.logs.join(" / ")}`);
      onField = after.zone === "battlefield";
    }
    // every ability of the permanent, one after the other
    const id = onField ? await page.evaluate(n => { const t = MikuGame.Lobby.table; const o = t.g.battlefield.find(x => x.controller === t.me && x.def.name === n); return o ? o.id : null; }, name) : null;
    for (let k = 0; id && k < 5; k++) {
      if (!(await page.evaluate(i => { const t = MikuGame.Lobby.table, o = t.g.find(i); if (o) t.inspect(o); return !!o; }, id))) break;
      await page.waitForTimeout(60);
      const btns = await page.$$(".mg-sheet.on .use:not([disabled])");
      if (k >= btns.length) { await page.evaluate(() => MikuGame.Lobby.table.closeSheet()); break; }
      const label = (await btns[k].innerText()).replace(/\s+/g, " ");
      const lb = await page.evaluate(() => MikuGame.Lobby.table.g.logs.length);
      await btns[k].click();
      const r = await settle(15000);
      const logs = await page.evaluate(lb => MikuGame.Lobby.table.g.logs.slice(lb).map(e => e.text).filter(s => !/\(Soul Warden\)/.test(s)).slice(-8), lb);
      if (r !== "main") note("never came back", `after "${label}": ${r}`, logs);
      if (VERBOSE) console.log(`    ${label}: ${logs.join(" / ")}`);
    }
    for (const d of await page.evaluate(() => [...document.querySelectorAll(".mg-log li")].filter(l => /Display error/.test(l.textContent)).map(l => l.textContent)))
      if (!issues.some(s => s.includes(d))) note("display error", d);
  }
  console.log(`${HERO}: ${issues.length} problem${issues.length === 1 ? "" : "s"}.`);
  await browser.close(); srv.close();
  process.exitCode = issues.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
