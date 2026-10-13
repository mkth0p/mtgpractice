#!/usr/bin/env python3
"""Price a Brago decklist from the Scryfall bulk in the repo.

usage: python3 -I tools/sim/brago/prices.py DECKLIST OUT.csv

Each card takes its cheapest non-foil USD price (Scryfall's TCGplayer price) among its tournament-legal
printings in research/miku-tournament/local/scryfall/default-cards.jsonl.gz (the bulk committed on
2026-10-10). Gold-bordered, oversized, memorabilia, token and digital printings are skipped, and so is
every Marvel Universes Beyond set (MSH, MSC, SPM, SPE, the Marvel Universe masterpieces MAR, Marvel promos
and art series: any set whose name says Marvel). Brago, King Eternal is priced as the Miku Secret
Lair printing (SLD 1601). EUR is an estimate: USD x 0.85. Every row names the printing (its Scryfall
page) the price comes from. Nothing is filled in when a card has no USD price: the row says so.
"""
import csv, gzip, json, os, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
BULK = os.path.join(REPO, "research/miku-tournament/local/scryfall/default-cards.jsonl.gz")
SOURCE = "Scryfall bulk default-cards (repo, committed 2026-10-10), TCGplayer USD"
DATE = "2026-10-10"
MARVEL = {"msh", "msc", "spm", "spe", "mar", "lmar", "pspm", "amsh", "aspm", "fmsc", "tmsc", "tmsh", "tspm"}
FORCED = {"Brago, King Eternal": ("sld", "1601")}
EUR_PER_USD = 0.85


def main():
    deck, out = sys.argv[1], sys.argv[2]
    names = []
    for line in open(deck, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        qty, name = line.split(" ", 1)
        names.append((int(qty), name.strip()))
    want = {n for _, n in names}
    best = {}
    for line in gzip.open(BULK, "rt", encoding="utf-8"):
        c = json.loads(line)
        n = c.get("name")
        if n not in want:
            continue
        if c.get("set") in MARVEL or "Marvel" in c.get("set_name", "") or c.get("digital") or c.get("oversized") or c.get("border_color") == "gold":
            continue
        if c.get("set_type") in ("memorabilia", "token", "minigame"):
            continue
        usd = (c.get("prices") or {}).get("usd")
        forced = FORCED.get(n)
        if forced and (c.get("set"), c.get("collector_number")) != forced:
            continue
        if usd is None:
            continue
        usd = float(usd)
        if n not in best or usd < best[n]["usd"]:
            best[n] = {"usd": usd, "url": c["scryfall_uri"].split("?")[0], "set": c["set"].upper(), "num": c["collector_number"],
                       "gc": bool(c.get("game_changer"))}
    total, gcs, rows = 0.0, 0, []
    for qty, n in names:
        b = best.get(n)
        if not b:
            rows.append([qty, n, "", "", "", "", "no USD price in the bulk", "", ""])
            continue
        total += qty * b["usd"]
        gcs += qty if b["gc"] else 0
        rows.append([qty, n, f"{b['usd']:.2f}", f"{b['usd'] * EUR_PER_USD:.2f}", f"{b['set']} {b['num']}", b["url"], SOURCE, DATE, "yes" if b["gc"] else "no"])
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["qty", "card", "price_usd", "price_eur_estimate_x0.85", "printing", "price_url", "source", "price_date", "game_changer"])
        w.writerows(rows)
        w.writerow(["", "TOTAL", f"{total:.2f}", f"{total * EUR_PER_USD:.2f}", "", "", f"{sum(q for q, _ in names)} cards, {gcs} Game Changers", DATE, ""])
    print(f"{sum(q for q, _ in names)} cards, ${total:.2f} (EUR estimate {total * EUR_PER_USD:.2f}), {gcs} Game Changers, missing: {[r[1] for r in rows if not r[2]]}")


if __name__ == "__main__":
    main()
