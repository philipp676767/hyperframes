#!/usr/bin/env python3
"""Put our thumbnails into a mock YouTube results page next to the real
competition — the honest test of references/thumbnail.md („Konkurrenz-Test“).

  python3 .claude/skills/youtube-erklaervideo/scripts/thumb-vergleich.py <slug>

Reads youtube/<slug>/konkurrenz.txt — one competitor per line:
    <video id or thumbnail URL> | <title> | <channel>
(collect 6–9 from the YouTube search for the video's search word with the
Tube_Alfred tools: youtube_search_query, sort relevance), and our
youtube/<slug>/thumb-{a,b,c}.jpg (or files given with --ours).
Writes youtube/<slug>/renders/vergleich-<x>.png per variant: a desktop grid
(4 per row, 360-px thumbnails as on youtube.com) with ours in slot 2, a
phone column (full-width 390-px list, ours second) and a greyscale strip.
Look at each sheet for one second: which thumbnail do you see first? Which
one tells you what you get and why you have to watch?
"""
import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

FONT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
FONT2 = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"


def font(p, s):
    try:
        return ImageFont.truetype(p, s)
    except OSError:
        return ImageFont.load_default()


def fetch(src, tmp, i):
    out = Path(tmp) / f"c{i}.jpg"
    url = src if src.startswith("http") else f"https://i.ytimg.com/vi/{src}/hqdefault.jpg"
    for u in ([f"https://i.ytimg.com/vi/{src}/maxresdefault.jpg", url] if not src.startswith("http") else [url]):
        r = subprocess.run(["curl", "-sS", "-f", "-o", str(out), u], capture_output=True)
        if r.returncode == 0 and out.stat().st_size > 2000:
            return Image.open(out).convert("RGB")
    return Image.new("RGB", (1280, 720), (40, 40, 40))


def cover(img, w, h):
    return ImageOps.fit(img, (w, h), Image.LANCZOS)


def wrap(draw, text, f, width, lines=2):
    words, out, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= width:
            cur = t
        else:
            out.append(cur)
            cur = w
            if len(out) == lines:
                break
    if len(out) < lines and cur:
        out.append(cur)
    if len(out) == lines and " ".join(out) != text:
        out[-1] = out[-1].rstrip(".,") + " …"
    return out[:lines]


def card(draw, page, img, title, chan, x, y, w, ours):
    h = int(w * 9 / 16)
    t = cover(img, w, h)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], 12, fill=255)
    page.paste(t, (x, y), mask)
    ft, fc = font(FONT, 17 if w < 400 else 19), font(FONT2, 14 if w < 400 else 15)
    for k, line in enumerate(wrap(draw, title, ft, w - 8)):
        draw.text((x + 2, y + h + 10 + k * 23), line, fill=(241, 241, 241), font=ft)
    draw.text((x + 2, y + h + 60), chan, fill=(170, 170, 170), font=fc)
    if ours:
        draw.rounded_rectangle([x - 4, y - 4, x + w + 3, y + h + 3], 14, outline=(255, 210, 63), width=3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--ours", nargs="*", help="our thumbnail files (default youtube/<slug>/thumb-*.jpg and *.png)")
    ap.add_argument("--title", default="", help="our video title (default: TITEL from upload.txt / plan.md)")
    a = ap.parse_args()
    root = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip())
    vid = root / "youtube" / a.slug
    lines = [l.split("|") for l in (vid / "konkurrenz.txt").read_text(encoding="utf8").splitlines() if l.strip() and not l.startswith("#")]
    ours = [Path(p) for p in a.ours] if a.ours else sorted([*vid.glob("thumb-*.jpg"), *vid.glob("thumb-*.png")])
    if not ours:
        sys.exit("no thumbnails of ours found")
    title = a.title
    if not title:
        up = vid / "upload.txt"
        if up.exists():
            t = up.read_text(encoding="utf8").split("\n")
            title = t[t.index("TITEL") + 1].strip() if "TITEL" in t else ""
        title = title or a.slug
    (vid / "renders").mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        comp = [(fetch(l[0].strip(), tmp, i), l[1].strip() if len(l) > 1 else "", l[2].strip() if len(l) > 2 else "") for i, l in enumerate(lines[:9])]
        for o in ours:
            me = (Image.open(o).convert("RGB"), title, "Unser Kanal")
            # desktop grid: 4 × 2, ours in slot 2
            items = comp[:1] + [me] + comp[1:7]
            W, cw, gap = 4 * 360 + 5 * 24, 360, 24
            page = Image.new("RGB", (W + 470, 2 * 300 + 60), (15, 15, 15))
            d = ImageDraw.Draw(page)
            for i, (img, ti, ch) in enumerate(items[:8]):
                card(d, page, img, ti, ch, gap + (i % 4) * (cw + gap), 30 + (i // 4) * 300, cw, img is me[0])
            # phone column: list, ours second, plus greyscale
            px = W + 30
            d.text((px, 6), "Handy", fill=(170, 170, 170), font=font(FONT2, 14))
            for k, (img, ti, ch) in enumerate([comp[0], me, comp[1]] if len(comp) > 1 else [me]):
                card(d, page, img, ti, ch, px, 30 + k * 200, 246, img is me[0])
            g = ImageOps.grayscale(cover(me[0], 160, 90)).convert("RGB")
            page.paste(g, (px + 270, 30))
            d.text((px + 270, 126), "Graustufen", fill=(170, 170, 170), font=font(FONT2, 13))
            out = vid / "renders" / f"vergleich-{o.stem.replace('thumb-', '')}.png"
            page.save(out)
            print(out)


if __name__ == "__main__":
    main()
