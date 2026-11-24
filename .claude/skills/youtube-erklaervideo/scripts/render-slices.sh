#!/usr/bin/env bash
# Render ONE chapter in short time slices (fallback when a whole-chapter render
# keeps stalling or the container restarts before a long chapter finishes).
# Each slice is a copy of the chapter with a time offset (window.HF_T0, read
# by world.js start()) and no audio; slices already rendered are kept, so a
# restart only costs the slice that was running. At the end the slices are
# joined losslessly and the chapter's own voice + sound track is laid under:
#   bash .claude/skills/youtube-erklaervideo/scripts/render-slices.sh <slug> <chapter> [seconds per slice = 20]
# → youtube/<slug>/kapitel/<chapter>/renders/kapitel.mp4 (same format as render-queue.sh)
# Progress lines go to youtube/<slug>/renders/queue.log (START / DONE / FAIL).
set -uo pipefail
SLUG=${1:?usage: render-slices.sh <slug> <chapter> [seconds]}
CH=${2:?chapter folder missing}
SEC=${3:-20}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
D="$ROOT/youtube/$SLUG/kapitel/$CH"
LOG="$ROOT/youtube/$SLUG/renders/queue.log"
mkdir -p "$ROOT/youtube/$SLUG/renders" "$D/renders/slices"
export HYPERFRAMES_RENDER_DETACHED=1
stamp() { date -u +%Y-%m-%dT%H:%M:%SZ; }
DUR=$(grep -o 'data-duration="[0-9.]*"' "$D/index.html" | head -1 | grep -o '[0-9.]*')
N=$(python3 -c "import math; print(math.ceil($DUR / $SEC - 1e-9))")
echo "SLICES $CH start $(stamp) ${DUR}s in $N slices of ${SEC}s" >> "$LOG"
for k in $(seq 0 $((N - 1))); do
  T0=$(python3 -c "print(round($k * $SEC, 3))")
  LEN=$(python3 -c "print(round(min($SEC, $DUR - $k * $SEC), 3))")
  S="$D/renders/slices/s$(printf '%02d' "$k")"
  OUT="$S/out.mp4"
  if [ -f "$OUT" ]; then
    GOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" 2>/dev/null || echo 0)
    python3 -c "import sys; sys.exit(0 if abs(float('${GOT:-0}') - $LEN) < 0.1 else 1)" && continue
  fi
  ok=0
  for try in 1 2 3; do
    rm -rf "$S"
    mkdir -p "$S"
    # the chapter without its renders, audio-free, shifted by T0
    (cd "$D" && tar --exclude=./renders --exclude=./.hyperframes -cf - .) | (cd "$S" && tar -xf -)
    python3 - "$S/index.html" "$T0" "$LEN" "$DUR" <<'PY'
import re, sys
p, t0, ln, dur = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
s = open(p).read()
s = re.sub(r'\s*<audio [^>]*></audio>', '', s)
s = s.replace(f'data-duration="{dur}"', f'data-duration="{ln}"')
s = s.replace(f'tl.set({{}}, {{}}, {dur});', f'tl.set({{}}, {{}}, {ln});')
s = s.replace('<head>', f'<head>\n    <script>window.HF_T0 = {t0};</script>', 1)
open(p, 'w').write(s)
PY
    sed -i 's|frame(e.detail.time)|frame(e.detail.time + (window.HF_T0 \|\| 0))|; s|frame(window.__hfThreeTime \|\| 0)|frame((window.__hfThreeTime \|\| 0) + (window.HF_T0 \|\| 0))|g' "$S/assets/world.js"
    echo "START $CH slice $k try $try $(stamp) (${T0}s +${LEN}s)" >> "$LOG"
    ( cd "$S" && npx --yes hyperframes@0.8.181 render -o out.mp4 > render.log 2>&1 < /dev/null )
    GOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT" 2>/dev/null || echo 0)
    if python3 -c "import sys; sys.exit(0 if abs(float('${GOT:-0}') - $LEN) < 0.1 else 1)"; then
      echo "DONE $CH slice $k $(stamp)" >> "$LOG"
      ok=1
      break
    fi
    echo "FAIL $CH slice $k try $try $(stamp): got ${GOT}s want ${LEN}s" >> "$LOG"
  done
  [ $ok = 1 ] || { echo "FAIL $CH slices gave up at slice $k" >> "$LOG"; exit 1; }
done
# join the picture losslessly, lay the chapter's voice + sounds under it
LIST="$D/renders/slices/list.txt"
: > "$LIST"
for k in $(seq 0 $((N - 1))); do echo "file 's$(printf '%02d' "$k")/out.mp4'" >> "$LIST"; done
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -an -c copy "$D/renders/slices/video.mp4"
ffmpeg -v error -y -i "$D/renders/slices/video.mp4" -i "$D/assets/voiceover.mp3" -i "$D/assets/sfx.mp3" \
  -filter_complex "[1:a][2:a]amix=inputs=2:normalize=0:duration=longest,apad,atrim=0:$DUR,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ac 2 -t "$DUR" "$D/renders/kapitel.mp4"
GOT=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/renders/kapitel.mp4")
echo "DONE $CH $(stamp) ${GOT}s (slices)" >> "$LOG"
