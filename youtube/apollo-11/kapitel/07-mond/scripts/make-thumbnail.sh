#!/usr/bin/env bash
# YouTube thumbnail (1280×720) from this chapter's 3D scene: the scene frozen
# at one strong moment + max 3 huge words — no captions, pills or labels.
#   bash scripts/make-thumbnail.sh <seconds> "<TEXT, keyword in <em>>" <layout> <name> ['<cam json>']
#     layout: links | rechts  (text on that side, subject on the other)
#             oben | unten    (text across the top / bottom, subject in the middle)
#     cam:    optional camera override, e.g. '{"p":[3,2,6],"l":[0,1.2,0]}'
#   e.g. make-thumbnail.sh 4.2 "Er <em>klaut</em> Wärme" rechts a
#   -> renders/thumb-a.png (1280×720, < 2 MB, as YouTube wants it)
# Works on a temporary copy of the chapter; index.html stays untouched.
set -euo pipefail
cd "$(dirname "$0")/.."
AT=${1:?usage: make-thumbnail.sh <seconds> "<text>" <links|rechts|oben|unten> <name> [cam json]}
TEXT=${2:?text missing}
LAYOUT=${3:-rechts}
NAME=${4:-a}
CAM=${5:-}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/p" renders
cp index.html "$TMP/p/"
cp -R assets "$TMP/p/assets"
rm -rf "$TMP/p/assets/vo_takes" "$TMP/p/assets/sfx"
python3 - "$TMP/p/index.html" "$AT" "$TEXT" "$LAYOUT" "$CAM" <<'PY'
import re, sys
path, at, text, layout, cam = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
html = open(path, encoding="utf8").read()
html = re.sub(r'\n?[ \t]*<audio\b[^>]*>\s*</audio>', "", html)
box = {
    "links": "left:90px;top:0;bottom:0;width:860px;display:flex;align-items:center;text-align:left;",
    "rechts": "right:90px;top:0;bottom:0;width:860px;display:flex;align-items:center;justify-content:flex-end;text-align:right;",
    "oben": "left:90px;right:90px;top:60px;text-align:center;",
    "unten": "left:90px;right:90px;bottom:70px;text-align:center;",
}[layout]
shade = {
    "links": "linear-gradient(90deg, rgba(14,10,24,.72), rgba(14,10,24,0) 58%)",
    "rechts": "linear-gradient(270deg, rgba(14,10,24,.72), rgba(14,10,24,0) 58%)",
    "oben": "linear-gradient(180deg, rgba(14,10,24,.7), rgba(14,10,24,0) 45%)",
    "unten": "linear-gradient(0deg, rgba(14,10,24,.7), rgba(14,10,24,0) 45%)",
}[layout]
style = f"""<style>
      #captions, #hook-title, #chapter, #question, #cmt, #cta, #fact, #labels, #hud {{ display: none !important; }}
      #thumb-shade {{ position: absolute; inset: 0; background: {shade}; }}
      #thumb-text {{ position: absolute; {box} font-family: "Montserrat", sans-serif; font-weight: 800;
        font-size: 176px; line-height: 0.98; letter-spacing: -3px; text-transform: uppercase; color: #fff;
        -webkit-text-stroke: 18px rgba(14, 10, 24, 0.9); paint-order: stroke fill;
        text-shadow: 0 12px 34px rgba(0, 0, 0, 0.55); }}
      #thumb-text em {{ font-style: normal; color: #ffd23f; }}
    </style>"""
cam_js = f"window.__cam = {cam};" if cam.strip() else ""
html = html.replace("</head>", f"  <script>window.HF_COVER_T = {at}; window.HF_NO_PANEL = true;{cam_js}</script>\n    {style}\n  </head>", 1)
html = html.replace(
    '<div id="captions"></div>',
    f'<div id="captions"></div>\n      <div id="thumb-shade"></div>\n      <div id="thumb-text"><span>{text}</span></div>',
    1,
)
open(path, "w", encoding="utf8").write(html)
PY

npx --yes hyperframes@0.8.181 snapshot "$TMP/p" --at 0.5 --no-end --describe false -o "$TMP/shot" >/dev/null
SHOT=$(find "$TMP/shot" -name "*.png" ! -name "*sheet*" | head -1)
[ -n "$SHOT" ] || { echo "error: snapshot produced no image" >&2; exit 1; }
ffmpeg -v error -y -i "$SHOT" -vf "scale=1280:720:flags=lanczos" "renders/thumb-$NAME.png"
echo "renders/thumb-$NAME.png ($(du -k "renders/thumb-$NAME.png" | cut -f1) KB)"
