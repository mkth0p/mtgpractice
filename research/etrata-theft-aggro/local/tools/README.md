# Proxy sheet generators (used once, 2026-10-07)
- `proxies-sheet.js`: diff of `decklist-heist-closer.txt` against the site's base Etrata list → `proxies-from-etrata-base.txt` (in/out) and `proxies-from-etrata-base.html` (9 per page, Scryfall images by the `cards/named` image endpoint).
- `proxies-cards.js OUT.json`: the cards to proxy as JSON (name, cheapest set/number from the index).
- `proxies-pdf.py OUT.pdf`: A4 PDF, 3×3 at 63.5 × 88.9 mm with no gaps and crop marks in the margins; expects the JPEGs in `$SCRATCH/img/<name>.jpg` (download them with curl from `https://api.scryfall.com/cards/named?exact=<name>&format=image&version=large`, one request every 150 ms, with a User-Agent). Pure Python, no libraries.
The PDF and the card images are not committed on the research branch (the images are Wizards of the Coast's).
