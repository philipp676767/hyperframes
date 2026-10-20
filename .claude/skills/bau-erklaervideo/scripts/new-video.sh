#!/usr/bin/env bash
# Scaffold a new video of the series from the skill template.
#   bash .claude/skills/bau-erklaervideo/scripts/new-video.sh <slug> "<Titel>"
#   e.g. new-video.sh aufzug "So funktioniert ein Aufzug"
# Creates tiktok/<slug>/ (repo root) with the shared world, captions + CTA,
# the stock CTA voice line and placeholder word timings, so it previews at once.
set -euo pipefail
SLUG=${1:?usage: new-video.sh <slug> "<Titel>"}
TITLE=${2:?usage: new-video.sh <slug> "<Titel>"}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
DEST="$ROOT/tiktok/$SLUG"
if [ -e "$DEST" ]; then
  echo "error: $DEST already exists" >&2
  exit 1
fi

CTA="$SKILL/assets/cta-christian-plasa.mp3"
# A fresh clone without LFS smudge only has the 130-byte pointer; fetch the real take.
is_lfs_pointer() { head -c 40 "$1" | grep -q "^version https://git-lfs"; }
if is_lfs_pointer "$CTA"; then
  git -C "$ROOT" lfs pull --include="${CTA#"$ROOT"/}"
  if is_lfs_pointer "$CTA"; then
    echo "error: $CTA is still an LFS pointer (git lfs pull failed)" >&2
    exit 1
  fi
fi

mkdir -p "$ROOT/tiktok"
cp -R "$SKILL/template" "$DEST"
mv "$DEST/gitignore" "$DEST/.gitignore"
mkdir -p "$DEST/assets/vo_takes"
cp "$CTA" "$DEST/assets/vo_takes/cta.mp3"
python3 - "$DEST" "$SLUG" "$TITLE" <<'EOF'
import json, sys
from pathlib import Path
dest, slug, title = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
html = dest / "index.html"
html.write_text(html.read_text(encoding="utf8").replace("__TITLE__", title), encoding="utf8")
pkg = json.loads((dest / "package.json").read_text())
pkg["name"] = slug
(dest / "package.json").write_text(json.dumps(pkg, indent=2) + "\n")
(dest / "meta.json").write_text(json.dumps({"id": slug, "name": title}, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
EOF
node "$DEST/scripts/fake-words.mjs" >/dev/null
node "$DEST/scripts/sync-html.mjs" >/dev/null
echo "created $DEST"
