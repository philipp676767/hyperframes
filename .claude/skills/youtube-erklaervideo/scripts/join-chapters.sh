#!/usr/bin/env bash
# Join the rendered chapters of a YouTube video into one file without
# re-encoding the picture, bring the sound to -14 LUFS and write the chapter
# time stamps for the description (YouTube chapters).
#   bash .claude/skills/youtube-erklaervideo/scripts/join-chapters.sh <slug>
# -> youtube/<slug>/renders/<slug>-final.mp4 + youtube/<slug>/kapitelmarken.txt
set -euo pipefail
SLUG=${1:?usage: join-chapters.sh <slug>}
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
VID="$ROOT/youtube/$SLUG"
mkdir -p "$VID/renders"
LIST="$VID/renders/concat.txt"
: > "$LIST"
MARKS="$VID/kapitelmarken.txt"
: > "$MARKS"
T=0
REF=""
for D in "$VID"/kapitel/*/; do
  D=${D%/}
  F="$D/renders/kapitel.mp4"
  [ -f "$F" ] || { echo "error: $(basename "$D") is not rendered yet ($F)" >&2; exit 1; }
  FMT=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name -of csv=p=0 "$F")
  [ -z "$REF" ] && REF=$FMT
  [ "$FMT" = "$REF" ] || { echo "error: $(basename "$D") is $FMT, the first chapter $REF" >&2; exit 1; }
  echo "file '$F'" >> "$LIST"
  TITLE=$(node -e '
    const fs = require("fs"); const vm = require("vm"); const c = { window: {} };
    vm.runInNewContext(fs.readFileSync(process.argv[1], "utf8"), c);
    console.log(c.window.HF_KAPITEL.titel);' "$D/assets/kapitel.js")
  python3 -c "t=int($T); print(f'{t//60}:{t%60:02d} $TITLE')" >> "$MARKS"
  T=$(python3 -c "print($T + $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"))")
done
OUT="$VID/renders/$SLUG-final.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
LEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
echo "$OUT: $(python3 -c "t=$LEN; print(f'{int(t//60)}:{int(t%60):02d} min')") · $(ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | xargs)"
python3 -c "import sys; t=$LEN; sys.exit(0 if 600 <= t <= 735 else 1)" || echo "WARNING: the video is $(python3 -c "print(round($LEN/60, 1))") min — the house length is 10–12 min."
echo "chapter marks -> $MARKS"; cat "$MARKS"
