#!/usr/bin/env python3
"""YouTube thumbnail (1280×720) from this chapter's 3D scene — the craft of
references/thumbnail.md (tatsache / vince / Simplicissimus / Kurzgesagt).

Two passes, so the grade never touches the lettering:
  1. the 3D scene frozen at one moment (optional camera override), no text,
     no tags, rendered at 1920×1080 with window.HF_THUMB = true (a scene may
     exaggerate for the thumbnail: more sparks, a brighter key light …);
  2. a colour grade (ffmpeg), then sharp lettering on top: a title in one of
     five styles, yellow labels with a pointer line, arrows, circles.

  python3 scripts/make-thumbnail.py --at 12.4 --name a \
      --cam '{"p":[3,2,6],"l":[0,1.2,0]}' --grade kino --hell 0.06 \
      --text 'MONDLANDUNG <em>FAST GESCHEITERT</em>' --style kino --pos unten-links \
      --label '1202' --label-box 1300,180 --label-point 1010,470 \
      --arrow 1500,700,1180,560,weiss --circle 980,520,90

All coordinates are pixels of the 1920×1080 frame (use --grid once to see a
labelled grid). Writes renders/thumb-<name>.jpg (1280×720, JPG ~95 %, well under YouTube's 2 MB) and
renders/thumb-<name>-check.png (feed sizes 360 / 246 px + greyscale).

Styles (--style):
  gross    huge clean white capitals (Anton), e.g. „APOLLO 13“, „GERMANIA“ (vince)
  kino     condensed capitals (Oswald) over a dark gradient, e.g. „KOKAIN-INSEL“ (tatsache)
  block    white capitals on a black box, small, a corner, e.g. „200 KM/H“ (tatsache)
  banner   white capitals on a red tilted ribbon, e.g. „DAS PURE BÖSE“ (Simplicissimus)
  zeitung  black serif on torn newspaper, optional red --kicker line (tatsache, vince)
  gelb     black condensed capitals on yellow bars, one bar per `|` part,
           e.g. „1907 GING ES GUT|1912 NICHT MEHR“ (stands out most in a dark feed)
Grades (--grade): kino (teal/orange), eis (bright cyan night/ice/sea), rot, kalt, warm, noir, neutral.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLI = ["npx", "--yes", "hyperframes@0.8.181"]

GRADES = {
    "eis": "eq=contrast=1.15:saturation=1.35:brightness=0.03,colorbalance=rs=-0.12:gs=0.02:bs=0.16:rm=-0.08:gm=0.04:bm=0.10:rh=0.02:bh=0.04",
    "kino": "eq=contrast=1.14:saturation=1.2:gamma=0.98,colorbalance=rs=-0.08:bs=0.12:bm=0.03:rh=0.10:gh=0.03:bh=-0.08",
    "rot": "eq=contrast=1.16:saturation=1.12,colorbalance=rs=0.12:bs=-0.05:rm=0.08:gm=-0.04:bm=-0.06:rh=0.05",
    "kalt": "eq=contrast=1.12:saturation=1.05,colorbalance=rs=-0.10:bs=0.15:rm=-0.05:bm=0.10",
    "warm": "eq=contrast=1.1:saturation=1.15,colorbalance=rs=0.06:rm=0.08:rh=0.08:bh=-0.08",
    "noir": "eq=contrast=1.3:saturation=0.22:brightness=-0.02",
    "neutral": "eq=contrast=1.08:saturation=1.1",
}

POS = {  # CSS for the title box
    "oben": "left:90px;right:90px;top:60px;text-align:center;",
    "unten": "left:90px;right:90px;bottom:70px;text-align:center;",
    "mitte": "left:90px;right:90px;top:50%;transform:translateY(-50%);text-align:center;",
    "links": "left:90px;width:900px;top:50%;transform:translateY(-50%);text-align:left;",
    "rechts": "right:90px;width:900px;top:50%;transform:translateY(-50%);text-align:right;",
    "oben-links": "left:80px;top:70px;max-width:1100px;text-align:left;",
    "oben-rechts": "right:80px;top:70px;max-width:1100px;text-align:right;",
    "unten-links": "left:80px;bottom:80px;max-width:1200px;text-align:left;",
    "unten-rechts": "right:80px;bottom:80px;max-width:1200px;text-align:right;",
}
SHADE = {
    "oben": "linear-gradient(180deg, rgba(8,8,14,.75), rgba(8,8,14,0) 45%)",
    "unten": "linear-gradient(0deg, rgba(8,8,14,.78), rgba(8,8,14,0) 45%)",
    "mitte": "radial-gradient(ellipse at center, rgba(8,8,14,.55), rgba(8,8,14,0) 60%)",
    "links": "linear-gradient(90deg, rgba(8,8,14,.75), rgba(8,8,14,0) 55%)",
    "rechts": "linear-gradient(270deg, rgba(8,8,14,.75), rgba(8,8,14,0) 55%)",
    "oben-links": "radial-gradient(ellipse at 0% 0%, rgba(8,8,14,.75), rgba(8,8,14,0) 55%)",
    "oben-rechts": "radial-gradient(ellipse at 100% 0%, rgba(8,8,14,.75), rgba(8,8,14,0) 55%)",
    "unten-links": "radial-gradient(ellipse at 0% 100%, rgba(8,8,14,.8), rgba(8,8,14,0) 58%)",
    "unten-rechts": "radial-gradient(ellipse at 100% 100%, rgba(8,8,14,.8), rgba(8,8,14,0) 58%)",
}


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"error: {' '.join(map(str, cmd[:4]))} …\n{r.stdout[-1500:]}\n{r.stderr[-1500:]}")
    return r


def snapshot(project, out_dir):
    run(CLI + ["snapshot", str(project), "--at", "0.5", "--no-end", "--describe", "false", "-o", str(out_dir)])
    shots = [p for p in Path(out_dir).rglob("*.png") if "sheet" not in p.name]
    if not shots:
        sys.exit("error: snapshot produced no image")
    return shots[0]


def pts(s, n):
    v = [x.strip() for x in s.split(",")]
    nums = [float(x) for x in v[:n]]
    return nums, v[n:]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--at", type=float, required=True, help="scene time in seconds")
    ap.add_argument("--name", default="a")
    ap.add_argument("--cam", default="", help='camera override JSON {"p":[x,y,z],"l":[x,y,z]}')
    ap.add_argument("--keep-tags", action="store_true", help="keep the scene's own name tags")
    ap.add_argument("--licht", type=float, default=1.0, help="poster light rig strength (0 = the scene's own light only)")
    ap.add_argument("--crop", default="", help="x,y,w — zoom into this part of the 1920×1080 frame (w ≥ 1280 keeps full sharpness)")
    ap.add_argument("--grade", default="kino", choices=list(GRADES))
    ap.add_argument("--hell", type=float, default=0.0, help="brightness lift, e.g. 0.06 for dark night scenes")
    ap.add_argument("--vignette", type=float, default=0.5, help="0 … 1")
    ap.add_argument("--grain", type=float, default=5, help="film grain 0 … 15")
    ap.add_argument("--text", default="", help="title, keyword in <em> (yellow; <b> = red)")
    ap.add_argument("--style", default="kino", choices=["gross", "kino", "block", "banner", "zeitung", "gelb"])
    ap.add_argument("--pos", default="unten-links", choices=list(POS))
    ap.add_argument("--size", type=int, default=0, help="max font size in px (default per style)")
    ap.add_argument("--kicker", default="", help="small red line above a zeitung title")
    ap.add_argument("--no-shade", action="store_true")
    ap.add_argument("--label", action="append", default=[], help="yellow label text (repeatable)")
    ap.add_argument("--label-box", action="append", default=[], help="x,y centre of the label box")
    ap.add_argument("--label-point", action="append", default=[], help="x,y the pointer touches")
    ap.add_argument("--arrow", action="append", default=[], help="x1,y1,x2,y2[,weiss|rot|gelb]")
    ap.add_argument("--circle", action="append", default=[], help="x,y,r[,rot|gelb|weiss]")
    ap.add_argument("--grid", action="store_true", help="draw a labelled 1920×1080 grid (placement aid)")
    a = ap.parse_args()

    os.chdir(ROOT)
    Path("renders").mkdir(exist_ok=True)
    tmp = Path(tempfile.mkdtemp())
    try:
        # ---------------------------------------------------------- pass 1: scene
        p1 = tmp / "scene"
        p1.mkdir()
        shutil.copy("index.html", p1)
        shutil.copytree("assets", p1 / "assets", ignore=shutil.ignore_patterns("vo_takes", "sfx"))
        html = (p1 / "index.html").read_text(encoding="utf8")
        html = re.sub(r"\n?[ \t]*<audio\b[^>]*>\s*</audio>", "", html)
        cam = f"window.__cam = {a.cam};" if a.cam.strip() else ""
        hide = "" if a.keep_tags else "#labels { display: none !important; }"
        html = html.replace(
            "</head>",
            f"  <script>window.HF_COVER_T = {a.at}; window.HF_THUMB = true; window.HF_THUMB_LIGHT = {a.licht}; window.HF_NO_PANEL = true; window.HF_NO_HUD = true;{cam}</script>\n"
            f"    <style>#captions, #hud {{ display: none !important; }} {hide}</style>\n  </head>",
            1,
        )
        (p1 / "index.html").write_text(html, encoding="utf8")
        shot = snapshot(p1, tmp / "shot1")

        # ---------------------------------------------------------- grade
        vf = []
        if a.crop:
            (cx, cy, cw), _ = pts(a.crop, 3)
            ch = cw * 9 / 16
            vf.append(f"crop={cw:.0f}:{ch:.0f}:{cx:.0f}:{cy:.0f},scale=1920:1080:flags=lanczos")
        vf.append(GRADES[a.grade])
        if a.hell:
            vf.append(f"eq=brightness={a.hell:.3f}:gamma={1 + a.hell * 2:.3f}")
        if a.vignette > 0:
            vf.append(f"vignette=angle={0.25 + 0.55 * a.vignette:.3f}")
        vf.append("unsharp=5:5:0.55")
        if a.grain > 0:
            vf.append(f"noise=alls={a.grain:.0f}:allf=t")
        p2 = tmp / "over"
        (p2 / "fonts").mkdir(parents=True)
        run(["ffmpeg", "-v", "error", "-y", "-i", str(shot), "-vf", ",".join(vf) + ",scale=1920:1080", str(p2 / "bg.png")])
        for f in Path("assets/fonts").glob("*.woff2"):
            shutil.copy(f, p2 / "fonts")

        # ---------------------------------------------------------- pass 2: lettering
        size = a.size or {"gross": 230, "kino": 190, "block": 120, "banner": 120, "zeitung": 120, "gelb": 140}[a.style]
        title = ""
        if a.text:
            inner = {
                "gross": f'<div class="t gross">{a.text}</div>',
                "kino": f'<div class="t kino">{a.text}</div>',
                "block": f'<div class="t block"><span>{a.text}</span></div>',
                "banner": f'<div class="t banner"><span>{a.text}</span></div>',
                "gelb": '<div class="t gelb">' + "".join(f"<span>{x.strip()}</span>" for x in a.text.split("|")) + "</div>",
                "zeitung": (f'<div class="t zeitung"><span>' + (f'<i>{a.kicker}</i>' if a.kicker else "") + f"{a.text}</span></div>"),
            }[a.style]
            title = f'<div id="tbox" style="position:absolute;{POS[a.pos]}">{inner}</div>'
        shade = ""
        if a.text and not a.no_shade and a.style in ("gross", "kino"):
            shade = f'<div style="position:absolute;inset:0;background:{SHADE[a.pos]}"></div>'
        svg = []
        labels_html = []
        for i, text in enumerate(a.label):
            (bx, by), _ = pts(a.label_box[i], 2)
            (px, py), _ = pts(a.label_point[i], 2)
            svg.append(f'<line x1="{bx}" y1="{by}" x2="{px}" y2="{py}" stroke="#111" stroke-width="16" stroke-linecap="round"/>'
                       f'<line x1="{bx}" y1="{by}" x2="{px}" y2="{py}" stroke="#ffd23f" stroke-width="8" stroke-linecap="round"/>'
                       f'<circle cx="{px}" cy="{py}" r="15" fill="#ffd23f" stroke="#111" stroke-width="6"/>')
            labels_html.append(f'<div class="lab" style="left:{bx}px;top:{by}px">{text}</div>')
        colors = {"weiss": "#ffffff", "rot": "#ff2a2a", "gelb": "#ffd23f"}
        for s in a.arrow:
            (x1, y1, x2, y2), rest = pts(s, 4)
            c = colors.get(rest[0] if rest else "weiss", "#ffffff")
            import math

            ang = math.atan2(y2 - y1, x2 - x1)
            hl, hw = 95, 70
            bx, by = x2 - hl * math.cos(ang), y2 - hl * math.sin(ang)
            lx, ly = bx + hw * math.sin(ang), by - hw * math.cos(ang)
            rx, ry = bx - hw * math.sin(ang), by + hw * math.cos(ang)
            for stroke, w in (("rgba(0,0,0,.55)", 50), (c, 30)):
                svg.append(f'<line x1="{x1}" y1="{y1}" x2="{bx}" y2="{by}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round"/>')
            svg.append(f'<polygon points="{x2},{y2} {lx},{ly} {rx},{ry}" fill="{c}" stroke="rgba(0,0,0,.55)" stroke-width="10" stroke-linejoin="round"/>')
        for s in a.circle:
            (cx, cy, r), rest = pts(s, 3)
            c = colors.get(rest[0] if rest else "rot", "#ff2a2a")
            svg.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.92}" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="22" transform="rotate(-8 {cx} {cy})"/>'
                       f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.92}" fill="none" stroke="{c}" stroke-width="12" transform="rotate(-8 {cx} {cy})"/>')
        grid = ""
        if a.grid:
            g = [f'<line x1="{x}" y1="0" x2="{x}" y2="1080" stroke="#0ff" stroke-width="2" opacity=".6"/><text x="{x + 6}" y="30" fill="#0ff" font-size="26">{x}</text>' for x in range(0, 1920, 160)]
            g += [f'<line x1="0" y1="{y}" x2="1920" y2="{y}" stroke="#0ff" stroke-width="2" opacity=".6"/><text x="6" y="{y - 6}" fill="#0ff" font-size="26">{y}</text>' for y in range(0, 1080, 120)]
            grid = "".join(g)
        page = f"""<!doctype html>
<html><head><meta charset="UTF-8" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face {{ font-family: M; src: url(fonts/montserrat-800.woff2); font-weight: 800; }}
@font-face {{ font-family: Anton; src: url(fonts/anton-400.woff2); }}
@font-face {{ font-family: Oswald; src: url(fonts/oswald-700.woff2); font-weight: 700; }}
@font-face {{ font-family: Playfair; src: url(fonts/playfair-display-900.woff2); font-weight: 900; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body, #root {{ width:1920px; height:1080px; overflow:hidden; background:#000; }}
#root {{ position:relative; }}
.t em {{ font-style:normal; color:#ffd23f; }}
.t b {{ color:#ff2a2a; }}
.gross {{ font-family:Anton; font-size:{size}px; line-height:.95; letter-spacing:2px; text-transform:uppercase; color:#fff;
  text-shadow:0 6px 0 rgba(0,0,0,.25), 0 12px 50px rgba(0,0,0,.65); }}
.kino {{ font-family:Oswald; font-weight:700; font-size:{size}px; line-height:.98; letter-spacing:1px; text-transform:uppercase; color:#fff;
  -webkit-text-stroke:6px rgba(5,5,10,.85); paint-order:stroke fill; text-shadow:0 10px 40px rgba(0,0,0,.7); }}
.block span {{ display:inline-block; font-family:M; font-weight:800; font-size:{size}px; line-height:1; text-transform:uppercase;
  color:#fff; background:#0b0b0f; padding:22px 34px 18px; box-shadow:0 14px 40px rgba(0,0,0,.45); }}
.banner span {{ display:inline-block; font-family:M; font-weight:800; font-size:{size}px; line-height:1; text-transform:uppercase; color:#fff;
  background:#e3101b; padding:26px 46px 20px; transform:rotate(-3deg) skewX(-6deg); box-shadow:0 16px 40px rgba(0,0,0,.5); }}
.banner span em {{ color:#fff; text-decoration:underline; }}
.zeitung span {{ display:inline-block; font-family:Playfair; font-weight:900; font-size:{size}px; line-height:1.02; color:#111;
  background:#f4f1ea; padding:34px 50px 30px; transform:rotate(-2deg); box-shadow:0 16px 40px rgba(0,0,0,.5);
  clip-path:polygon(0 4%,4% 0,9% 3%,15% 0,22% 2%,30% 0,38% 3%,46% 0,55% 2%,63% 0,71% 3%,79% 0,87% 2%,94% 0,100% 3%,98% 50%,100% 97%,93% 100%,85% 97%,77% 100%,68% 97%,60% 100%,51% 97%,43% 100%,34% 97%,26% 100%,17% 97%,9% 100%,2% 97%,0 50%); }}
.zeitung i {{ display:block; font-family:M; font-weight:800; font-style:normal; font-size:{int(size * 0.36)}px; color:#d10f14; margin-bottom:10px; }}
.zeitung em {{ color:#d10f14; }}
.gelb span {{ display:table; font-family:Oswald; font-weight:700; font-size:{size}px; line-height:1.02; text-transform:uppercase;
  color:#111; background:#ffd23f; padding:8px 26px 4px; margin:0 0 14px; box-shadow:0 12px 30px rgba(0,0,0,.5); }}
.gelb em {{ font-style:normal; color:#c4000a; }}
#tbox[style*="text-align:right"] .gelb span {{ margin-left:auto; }}
#tbox[style*="text-align:center"] .gelb span {{ margin-left:auto; margin-right:auto; }}
.lab {{ position:absolute; transform:translate(-50%,-50%); font-family:M; font-weight:800; font-size:86px; line-height:1;
  text-transform:uppercase; color:#111; background:#ffd23f; padding:18px 30px 14px; border:6px solid #111; white-space:nowrap;
  box-shadow:0 12px 30px rgba(0,0,0,.45); }}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="1" data-width="1920" data-height="1080">
  <img src="bg.png" style="position:absolute;inset:0;width:1920px;height:1080px" />
  {shade}
  <svg width="1920" height="1080" style="position:absolute;inset:0">{''.join(svg)}{grid}</svg>
  {''.join(labels_html)}
  {title}
</div>
<script>
  // shrink the title until it fits its box (max 3 lines) and the frame
  (async function () {{
    await document.fonts.ready;
    const box = document.getElementById("tbox");
    if (box) {{
      const el = box.firstElementChild;
      let s = {size};
      const fits = () => {{
        const r = box.getBoundingClientRect();
        const lines = el.getBoundingClientRect().height / (s * 1.02);
        return r.left >= 40 && r.right <= 1880 && r.top >= 30 && r.bottom <= 1050 && lines <= 3.2 && el.scrollWidth <= box.clientWidth + 4;
      }};
      const set = (v) => {{ el.style.fontSize = v + "px"; el.querySelectorAll("span").forEach((x) => (x.style.fontSize = v + "px")); }};
      while (s > 70 && (set(s), !fits())) s -= 6;
    }}
  }})();
  const tl = gsap.timeline({{ paused: true }});
  tl.set({{}}, {{}}, 1);
  window.__timelines = window.__timelines || {{}};
  window.__timelines["main"] = tl;
</script>
</body></html>"""
        (p2 / "index.html").write_text(page, encoding="utf8")
        final = snapshot(p2, tmp / "shot2")
        # JPG, quality ~95: a few hundred KB — YouTube refuses thumbnails over 2 MB (a grainy PNG is ~2 MB)
        out = Path(f"renders/thumb-{a.name}.jpg")
        run(["ffmpeg", "-v", "error", "-y", "-i", str(final), "-vf", "scale=1280:720:flags=lanczos", "-q:v", "2", str(out)])
        # ---------------------------------------------------------- feed check
        chk = Path(f"renders/thumb-{a.name}-check.png")
        run(["ffmpeg", "-v", "error", "-y", "-i", str(out), "-filter_complex",
             "color=c=0x0f0f0f:s=1000x260[bg];[0]scale=360:202[d];[0]scale=246:138[m];[0]scale=246:138,hue=s=0[g];"
             "[bg][d]overlay=20:29[a];[a][m]overlay=410:61[b];[b][g]overlay=690:61", "-frames:v", "1", str(chk)])
        kb = out.stat().st_size // 1024
        print(f"{out} ({kb} KB) · {chk} (feed 360 px, phone 246 px, greyscale)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
