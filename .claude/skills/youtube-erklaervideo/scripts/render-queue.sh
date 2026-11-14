#!/usr/bin/env bash
# Render every chapter of a YouTube video one after the other (~4 s per frame:
# a 90-s chapter ≈ 3 h, 12 min ≈ 20–25 h in all). A chapter whose
# renders/kapitel.mp4 is newer than its inputs is skipped, so after a crash or
# a container restart simply start the queue again: it only costs the chapter
# that was running. ALWAYS start it detached (SKILL.md "Render"):
#   HYPERFRAMES_RENDER_DETACHED=1 setsid nohup bash .claude/skills/youtube-erklaervideo/scripts/render-queue.sh <slug> \
#     > /dev/null 2>&1 < /dev/null & disown
# Progress: youtube/<slug>/renders/queue.log — one START / DONE / FAIL line per
# chapter (watch it with ONE Monitor that prints only DONE / FAIL / QUEUE lines).
# Optional: chapter folder names after the slug render only those.
set -uo pipefail
SLUG=${1:?usage: render-queue.sh <slug> [chapter …]}
shift
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
VID="$ROOT/youtube/$SLUG"
mkdir -p "$VID/renders"
LOG="$VID/renders/queue.log"
export HYPERFRAMES_RENDER_DETACHED=1
stamp() { date -u +%Y-%m-%dT%H:%M:%SZ; }
if [ $# -gt 0 ]; then
  DIRS=()
  for c in "$@"; do DIRS+=("$VID/kapitel/$c"); done
else
  DIRS=("$VID"/kapitel/*)
fi
echo "QUEUE start $(stamp) ${#DIRS[@]} chapters" >> "$LOG"
for D in "${DIRS[@]}"; do
  C=$(basename "$D")
  OUT="$D/renders/kapitel.mp4"
  if [ -f "$OUT" ] && [ -z "$(find "$D/index.html" "$D/assets" -newer "$OUT" -type f ! -path '*/vo_takes/*' ! -name 'sfx-cues.json' 2>/dev/null | head -1)" ]; then
    echo "SKIP $C (render is up to date)" >> "$LOG"
    continue
  fi
  WANT=$(grep -o 'data-duration="[0-9.]*"' "$D/index.html" | head -1 | grep -o '[0-9.]*')
  ok=0
  for try in 1 2; do
    rm -rf "$D"/renders/work-* "$D"/renders/.kapitel.hf-transaction-* 2>/dev/null
    echo "START $C try $try $(stamp) (${WANT}s ≈ $(python3 -c "print(round($WANT * 30 * 4 / 3600, 1))") h)" >> "$LOG"
    T0=$(date +%s)
    mkdir -p "$D/renders"
    ( cd "$D" && npx --yes hyperframes@0.8.181 render -o renders/kapitel.mp4 > renders/render.log 2>&1 < /dev/null )
    GOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" 2>/dev/null || echo 0)
    if python3 -c "import sys; sys.exit(0 if abs(float('${GOT:-0}') - $WANT) < 0.5 else 1)"; then
      echo "DONE $C $(stamp) ${GOT}s in $(( ($(date +%s) - T0) / 60 )) min" >> "$LOG"
      ok=1
      break
    fi
    echo "FAIL $C try $try $(stamp): got ${GOT}s, want ${WANT}s — $(tail -n 2 "$D/renders/render.log" | tr '\n' ' ' | cut -c1-300)" >> "$LOG"
    rm -f "$OUT"
  done
  [ $ok = 1 ] || echo "FAIL $C gave up after 2 tries" >> "$LOG"
done
echo "QUEUE end $(stamp)" >> "$LOG"
