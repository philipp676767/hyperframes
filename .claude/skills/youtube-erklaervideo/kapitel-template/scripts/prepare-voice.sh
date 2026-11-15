#!/usr/bin/env bash
# Build assets/voiceover.mp3 for ONE chapter from the raw ElevenLabs take
# (assets/vo_takes/main.mp3). Long-form pace (skill youtube-erklaervideo):
# Jan a little calmer than on TikTok — every chapter is brought to the same
# speaking rate RATE (default 2.5 words/s — a calm documentary narrator,
# 2026-11-15; was 2.8), so the chapters
# sound like one take when they are joined:
#   - pauses (found at -30 dB) are cut to PAUSE s (default 0.3 — room to
#     breathe between sentences; TikTok 0.12);
#   - the rest is sped up / slowed down (pitch kept) until the chapter speaks
#     RATE words per second — at most x1.32 faster (Jan on eleven_v3 reads
#     ≈ 2.2–2.4 words/s with 0.2-s breaths, so ~x1.2 is normal; the TikTok
#     series runs him at x1.15–1.28), x0.97 slower; outside
#     that it stops and says why (a piece-wise take that reads very slowly →
#     regenerate, or set BASE by hand);
#   - a short LEAD of silence (default 0.25 s) before the first word, so a
#     chapter cut never clips a breath;
#   - loudness -14 LUFS (the joined video is normalised again at the end).
#   bash scripts/prepare-voice.sh            RATE=2.75 / PAUSE=0.24 / BASE=1.1 (fixed tempo)
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN=${1:-assets/vo_takes/main.mp3}
RATE=${RATE:-2.5}
PAUSE=${PAUSE:-0.3}
LEAD=${LEAD:-0.25}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

python3 -I scripts/tighten-pauses.py "$MAIN" "$TMP/main.wav" "$PAUSE"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/main.wav")
N=$(node -e '
  const fs = require("fs");
  const s = fs.readFileSync("script.txt", "utf8").replace(/\[[^\]\n]*\]/g, " ");
  console.log(s.split(/\s+/).filter((w) => w && w !== "–" && w !== "—").length);
')
if [ -n "${BASE:-}" ]; then
  TEMPO=$BASE
else
  TEMPO=$(python3 -c "print(round($RATE * $D / $N, 4))")
  if python3 -c "import sys; sys.exit(0 if $TEMPO > 1.32 else 1)"; then
    echo "ERROR: the take reads very slowly ($(python3 -c "print(round($N / $D, 2))") words/s after the pause cut) — it would need x$TEMPO. Regenerate it in one piece, or set BASE=1.32 and accept a slower chapter." >&2
    exit 1
  fi
  if python3 -c "import sys; sys.exit(0 if $TEMPO < 0.97 else 1)"; then
    echo "ERROR: the take is already faster than ${RATE} words/s — try PAUSE=0.28 (longer breaths) or RATE=$(python3 -c "print(round($N / $D, 2))")." >&2
    exit 1
  fi
fi
ffmpeg -v error -y -i "$TMP/main.wav" -af "atempo=${TEMPO},adelay=$(python3 -c "print(int($LEAD * 1000))"):all=1,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 44100 -b:a 192k assets/voiceover.mp3
FINAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3)
echo "$N words · ${D}s after pause cut -> atempo ${TEMPO} -> assets/voiceover.mp3 ${FINAL}s ($(python3 -c "print(round($N / ($FINAL - $LEAD), 2))") words/s incl. breaths)"
