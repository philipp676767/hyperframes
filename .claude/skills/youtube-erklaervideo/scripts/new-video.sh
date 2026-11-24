#!/usr/bin/env bash
# Scaffold a new long YouTube video (skill youtube-erklaervideo).
#   bash .claude/skills/youtube-erklaervideo/scripts/new-video.sh <slug> "<Titel>"
# Creates youtube/<slug>/ (repo root):
#   plan.md          title, thumbnails, chapters, facts, loop map (fill in)
#   fortschritt.md   progress per chapter — a new chat continues from here
#   welt.js          the video's main world (copied into every chapter)
#   kapitel/         one composition per chapter (scripts/new-chapter.sh)
#   renders/         joined video + thumbnails (git-ignored)
set -euo pipefail
SLUG=${1:?usage: new-video.sh <slug> "<Titel>"}
TITLE=${2:?usage: new-video.sh <slug> "<Titel>"}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
DEST="$ROOT/youtube/$SLUG"
if [ -e "$DEST" ]; then
  echo "error: $DEST already exists" >&2
  exit 1
fi
mkdir -p "$DEST/kapitel"
printf 'renders/\n' > "$DEST/.gitignore"
# the main world starts as the template's demo world (replace it, SKILL.md step 4)
cp "$SKILL/kapitel-template/assets/set.js" "$DEST/welt.js"
sed -e "s|%SLUG%|$SLUG|g" -e "s|%TITLE%|$TITLE|g" "$SKILL/references/plan-vorlage.md" > "$DEST/plan.md"
cat > "$DEST/fortschritt.md" <<MD
# Fortschritt: $TITLE

Stand für einen neuen Chat (Skill \`youtube-erklaervideo\`, Schritt „Weitermachen“).
Status je Kapitel: geplant → skript → stimme → szene → geprüft → gerendert.

Credits (ElevenLabs, Budget 9 500–10 000 pro Video): verbraucht 0 · übrig vom Video-Budget 10000

| Nr | Ordner | Kapitel | Wörter | Zeichen | Sprechzeit | Status | Notiz |
| -- | ------ | ------- | ------ | ------- | ---------- | ------ | ----- |

## Video

- [ ] Titel + 3 Thumbnail-Ideen (plan.md)
- [ ] Skript im Credit-Budget (scripts/credits.py OK, 9 300–9 800 Zeichen)
- [ ] Hauptwelt (welt.js) geprüft
- [ ] Alle Kapitel gerendert
- [ ] Zusammengefügt + Lautheit (-14 LUFS)
- [ ] 3 Thumbnails
- [ ] Beschreibung mit Kapitel-Zeitmarken, Tags, Einstellungen, Kommentar (upload.txt)
- [ ] youtube/serie.md eingetragen
MD
echo "created $DEST — next: plan.md, then scripts/new-chapter.sh $SLUG 0 hook"
