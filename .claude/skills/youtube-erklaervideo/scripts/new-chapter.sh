#!/usr/bin/env bash
# Add one chapter (= one composition) to a YouTube video.
#   bash .claude/skills/youtube-erklaervideo/scripts/new-chapter.sh <slug> <nr> <name> ["<Titel>"] [ende]
#   e.g. new-chapter.sh mond-crash 0 hook
#        new-chapter.sh mond-crash 3 gezeiten "Die Monster-Flut"
#        new-chapter.sh mond-crash 8 finale "Die Antwort" ende
# Creates youtube/<slug>/kapitel/<NN>-<name>/ from kapitel-template with the
# shared kit + the video's main world (welt.js, imported by assets/set.js),
# a placeholder script and estimated timings, so it previews at once.
set -euo pipefail
SLUG=${1:?usage: new-chapter.sh <slug> <nr> <name> ["<Titel>"] [ende]}
NR=${2:?nr missing}
NAME=${3:?name missing}
TITLE=${4:-$NAME}
ENDE=${5:-}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
VID="$ROOT/youtube/$SLUG"
[ -d "$VID" ] || { echo "error: $VID missing — run new-video.sh first" >&2; exit 1; }
DEST="$VID/kapitel/$(printf '%02d' "$NR")-$NAME"
[ -e "$DEST" ] && { echo "error: $DEST already exists" >&2; exit 1; }
cp -R "$SKILL/kapitel-template" "$DEST"
mv "$DEST/gitignore" "$DEST/.gitignore"
mkdir -p "$DEST/assets/vo_takes"
cp "$VID/welt.js" "$DEST/assets/welt.js"
cat > "$DEST/assets/set.js" <<'JS'
// This chapter's place: the video's main world (youtube/<slug>/welt.js, copied
// in by new-chapter.sh / sync-kit.sh). For a side scene of its own, replace
// this import with the side world, built the same way (set kit).
import "./welt.js";
JS
python3 - "$DEST" "$NR" "$TITLE" "$ENDE" "$SLUG-$NAME" <<'PY'
import json, re, sys
from pathlib import Path
dest, nr, title, ende, pkg_name = Path(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4] == "ende", sys.argv[5]
k = dest / "assets" / "kapitel.js"
s = k.read_text(encoding="utf8")
s = re.sub(r"nr: \d+,", f"nr: {nr},", s, count=1)
s = re.sub(r'titel: "[^"]*",', f"titel: {json.dumps(title, ensure_ascii=False)},", s, count=1)
s = re.sub(r"ende: (true|false),", f"ende: {'true' if ende else 'false'},", s, count=1)
if nr != 0:
    s = re.sub(r'  // hook chapter only[^\n]*\n  hookTitel: "[^"]*",\n', "", s)
k.write_text(s, encoding="utf8")
html = dest / "index.html"
html.write_text(html.read_text(encoding="utf8").replace("__TITLE__", title), encoding="utf8")
p = dest / "package.json"
pkg = json.loads(p.read_text())
pkg["name"] = pkg_name
p.write_text(json.dumps(pkg, indent=2) + "\n")
PY
# the end chapter starts from its own demo (payoff, CTA line, end-screen shot)
if [ -n "$ENDE" ]; then
  cp "$DEST/demo-ende/script.txt" "$DEST/script.txt"
  cp "$DEST/demo-ende/beats.js" "$DEST/demo-ende/scene.js" "$DEST/assets/"
fi
rm -rf "$DEST/demo-ende"
( cd "$DEST" && node scripts/fake-words.mjs >/dev/null && python3 scripts/make-sfx.py >/dev/null \
  && node scripts/build-sfx.mjs >/dev/null && node scripts/sync-html.mjs >/dev/null )
echo "created $DEST"
