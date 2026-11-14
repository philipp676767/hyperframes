#!/usr/bin/env bash
# Copy the shared engine (the skill's kapitel-template kit) and the video's
# main world (youtube/<slug>/welt.js) into every chapter, then re-sync each
# chapter's sounds + index.html. Run after changing welt.js or the kit.
# A chapter's own files stay: script.txt, assets/{kapitel,beats,scene,set,words}.js,
# voice, sfx-extra.py.
#   bash .claude/skills/youtube-erklaervideo/scripts/sync-kit.sh <slug>
set -euo pipefail
SLUG=${1:?usage: sync-kit.sh <slug>}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
VID="$ROOT/youtube/$SLUG"
T="$SKILL/kapitel-template"
for D in "$VID"/kapitel/*/; do
  D=${D%/}
  for f in world.js environments.js props.js post.js hud.js hand.js timing.js; do
    cp "$T/assets/$f" "$D/assets/$f"
  done
  cp -R "$T/assets/fonts" "$D/assets/"
  find "$T/scripts" -maxdepth 1 -type f ! -name sfx-extra.py -exec cp {} "$D/scripts/" \;
  cp "$VID/welt.js" "$D/assets/welt.js"
  # index.html is generic: take the template's, keep the chapter's <title>
  TITLE=$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$D/index.html" | head -1)
  sed "s|__TITLE__|$TITLE|" "$T/index.html" > "$D/index.html"
  ( cd "$D" && node scripts/build-sfx.mjs >/dev/null && node scripts/sync-html.mjs >/dev/null ) \
    && echo "synced $(basename "$D")"
done
