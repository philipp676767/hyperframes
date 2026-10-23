#!/usr/bin/env bash
# Cover image (TikTok "Titelbild") for the finished video: the 3D scene frozen
# at one strong moment (subject in x-ray, glowing, mid-action) with a big
# curiosity title on top — no captions, buttons or labels.
#   bash scripts/make-cover.sh <seconds> "Dein Kühlschrank <em>lügt</em>"
#   -> renders/<slug>-cover.png (1080×1920). Keyword in <em> turns yellow.
# Works on a temporary copy of the project; index.html stays untouched.
set -euo pipefail
cd "$(dirname "$0")/.."
AT=${1:?usage: make-cover.sh <seconds> "<title with <em>keyword</em>>"}
TITLE=${2:?usage: make-cover.sh <seconds> "<title with <em>keyword</em>>"}
SLUG=$(basename "$PWD")
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/p" renders
cp index.html "$TMP/p/"
cp -R assets "$TMP/p/assets"
rm -rf "$TMP/p/assets/vo_takes" "$TMP/p/assets/sfx"
python3 - "$TMP/p/index.html" "$AT" "$TITLE" <<'EOF'
import re, sys
path, at, title = sys.argv[1], float(sys.argv[2]), sys.argv[3]
html = open(path, encoding="utf8").read()
html = re.sub(r'\n?[ \t]*<audio\b[^>]*>\s*</audio>', "", html)
style = """<style>
      #captions, #hook-title, #cmt, #cta, #fact, #labels { display: none !important; }
      #cover-shade { position: absolute; left: 0; right: 0; top: 0; height: 900px;
        background: linear-gradient(rgba(20, 12, 30, 0.45), rgba(20, 12, 30, 0)); }
      #cover-title { position: absolute; left: 60px; right: 60px; top: 300px;
        text-align: center; font-family: "Montserrat", sans-serif; font-weight: 800;
        font-size: 132px; line-height: 1.04; color: #fff; transform: rotate(-2deg);
        -webkit-text-stroke: 14px rgba(20, 12, 30, 0.75); paint-order: stroke fill;
        text-shadow: 0 10px 30px rgba(0, 0, 0, 0.45); }
      #cover-title em { font-style: normal; color: #ffd23f; }
    </style>"""
html = html.replace("</head>", f"  <script>window.HF_COVER_T = {at};</script>\n    {style}\n  </head>", 1)
html = html.replace(
    '<div id="captions"></div>',
    f'<div id="captions"></div>\n      <div id="cover-shade"></div>\n      <div id="cover-title">{title}</div>',
    1,
)
open(path, "w", encoding="utf8").write(html)
EOF

npx --yes hyperframes@0.8.181 snapshot "$TMP/p" --at 0.5 --no-end --describe false -o "$TMP/shot" >/dev/null
SHOT=$(find "$TMP/shot" -name "*.png" ! -name "*sheet*" | head -1)
[ -n "$SHOT" ] || { echo "error: snapshot produced no image" >&2; exit 1; }
ffmpeg -v error -y -i "$SHOT" -vf "scale=1080:1920" "renders/$SLUG-cover.png"
echo "renders/$SLUG-cover.png"
