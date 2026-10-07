# A4 proxy sheets: 3x3 cards at 63.5 x 88.9 mm, no gaps, crop marks in the margins; JPEGs embedded as-is (DCTDecode), no libraries.
import json, struct, os, sys
SP = "${SCRATCH:-/tmp/etrata-proxies}"
OUT = sys.argv[1]
cards = json.load(open(SP + "/cards.json"))
PT = 72 / 25.4
PW, PH = 210 * PT, 297 * PT
CW, CH = 63.5 * PT, 88.9 * PT
X0 = (PW - 3 * CW) / 2; Y0 = (PH - 3 * CH) / 2
def jpeg_size(data):
    i = 2
    while i < len(data):
        if data[i] != 0xFF: i += 1; continue
        m = data[i + 1]
        if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7: i += 2; continue
        L = struct.unpack(">H", data[i + 2:i + 4])[0]
        if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            h, w = struct.unpack(">HH", data[i + 5:i + 9]); comps = data[i + 9]
            return w, h, comps
        i += 2 + L
    raise ValueError("no SOF")
objs = []  # list of bytes (object bodies), 1-based ids
def add(body): objs.append(body); return len(objs)
# images
imgs = []
for c in cards:
    data = open(SP + "/img/" + c["file"], "rb").read()
    w, h, comps = jpeg_size(data)
    cs = b"/DeviceRGB" if comps == 3 else (b"/DeviceGray" if comps == 1 else b"/DeviceCMYK")
    oid = add(b"<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace %s /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n" % (w, h, cs, len(data)) + data + b"\nendstream")
    imgs.append(oid)
pages = []
pages_id_placeholder = None
for p in range(0, len(imgs), 9):
    chunk = imgs[p:p + 9]
    content = b""
    res = b""
    for k, oid in enumerate(chunk):
        col, row = k % 3, k // 3
        x = X0 + col * CW; y = PH - Y0 - (row + 1) * CH
        content += b"q %.3f 0 0 %.3f %.3f %.3f cm /Im%d Do Q\n" % (CW, CH, x, y, k)
        res += b"/Im%d %d 0 R " % (k, oid)
    # crop marks: 5 mm ticks outside the grid at every cut line (no ink between cards)
    t = 5 * PT; g = 1.5 * PT
    content += b"0.4 w 0 G\n"
    for i in range(4):
        x = X0 + i * CW
        content += b"%.3f %.3f m %.3f %.3f l S\n" % (x, PH - Y0 + g, x, PH - Y0 + g + t)
        content += b"%.3f %.3f m %.3f %.3f l S\n" % (x, Y0 - g, x, Y0 - g - t)
        y = PH - Y0 - i * CH
        content += b"%.3f %.3f m %.3f %.3f l S\n" % (X0 - g, y, X0 - g - t, y)
        content += b"%.3f %.3f m %.3f %.3f l S\n" % (PW - X0 + g, y, PW - X0 + g + t, y)
    cid = add(b"<< /Length %d >>\nstream\n" % len(content) + content + b"endstream")
    pages.append((cid, res))
pages_id = len(objs) + len(pages) + 1
page_ids = []
for cid, res in pages:
    pid = add(b"<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.3f %.3f] /Resources << /XObject << %s>> >> /Contents %d 0 R >>" % (pages_id, PW, PH, res, cid))
    page_ids.append(pid)
assert add(b"<< /Type /Pages /Kids [%s] /Count %d >>" % (b" ".join(b"%d 0 R" % i for i in page_ids), len(page_ids))) == pages_id
cat = add(b"<< /Type /Catalog /Pages %d 0 R >>" % pages_id)
info = add(b"<< /Title (Etrata heist closer proxies) /Producer (mtgpractice) >>")
out = bytearray(b"%PDF-1.5\n%\xe2\xe3\xcf\xd3\n")
offs = []
for i, body in enumerate(objs, 1):
    offs.append(len(out)); out += b"%d 0 obj\n" % i + body + b"\nendobj\n"
xref = len(out)
out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1) + b"".join(b"%010d 00000 n \n" % o for o in offs)
out += b"trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, cat, info, xref)
open(OUT, "wb").write(out)
print("pages", len(page_ids), "cards", len(imgs), "size %.1f MB" % (len(out) / 1e6), "card %.2fx%.2f mm at x=%.1f mm, y=%.1f mm margins" % (CW / PT, CH / PT, X0 / PT, Y0 / PT))
