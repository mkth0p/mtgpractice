/* Cards the Miku tournament research (research/miku-tournament/) tests in the Trostani precon that the engine didn't have.
   Sim only: the site's file lists (app.js GAME_FILES, sw.js) don't load this file. Text is the Scryfall Oracle text
   (bulk data of 2026-10-07); `note` says where the engine simplifies. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const mine = (s, o) => o.controller === s.controller;

  T.mikuSquirrel = MK.tokenDef({ key: "squirrel-g11", name: "Squirrel", pt: [1, 1], colors: "G", subtypes: ["Squirrel"] });

  D({
    name: "Scurry Oak", cost: "{2}{G}", type: "Creature — Treefolk", pt: "1/2",
    keywords: ["evolve"],
    text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on this creature, you may create a 1/1 green Squirrel creature token.",
    note: "With Trostani and a \"whenever you gain life, put a +1/+1 counter\" card (Archangel of Thune, Heliod, Cleric Class at level 2) the Squirrels loop forever; a player names a number, and the engine stops at 60 Squirrels a turn.",
    triggers: [
      {
        // evolve: checked when the creature enters and again on resolution (intervening if)
        on: "enters",
        when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o) && (g.power(ev.o) > g.power(s) || g.toughness(ev.o) > g.toughness(s)),
        intervening: (g, s, ev) => {
          const o = ev.o, lk = o.zone === "battlefield" ? { p: g.power(o), t: g.toughness(o) } : { p: (ev.lki && ev.lki.power) || 0, t: (ev.lki && ev.lki.toughness) || 0 };
          return lk.p > g.power(s) || lk.t > g.toughness(s);
        },
        do: (g, s) => g.addCounters(s, "p1", 1, s)
      },
      {
        on: "counters", when: (g, s, ev) => ev.o === s && ev.kind === "p1" && ev.n > 0,
        optional: "Scurry Oak: create a 1/1 Squirrel?", ai: "scurryOak",
        do: (g, s, ev, { p }) => {
          const k = "oak" + g.turn;
          s.state[k] = (s.state[k] || 0) + 1;
          if (s.state[k] > 60) return;
          g.createToken(p, T.mikuSquirrel);
        }
      }
    ],
    ai: { priority: 6 }
  });
})(typeof window !== "undefined" ? window : globalThis);
