#!/usr/bin/env bash
# Build assets/voiceover.mp3 from the raw ElevenLabs take (whole script incl.
# the follow line and the comment question) and fit it to the house length:
# every video is EXACTLY one minute (user's rule, 2026-10-24) and simply
# ends after the comment question (no loop line). The speech must end
# ~1.2 s before 60 s (TARGET 58.8) so the last shot can breathe:
#   - pauses (found at -30 dB) are first cut to 0.12 s;
#   - too long  → sped up (pitch kept), at most 8 %;
#   - too short → the pauses between phrases are stretched evenly, at most
#     to 0.45 s each.
# Outside that it stops and says how many words to cut or add. An extra
# CTA take (assets/vo_takes/cta.mp3, old episodes only) is appended if present.
# Loudness -14 LUFS.
#   bash scripts/prepare-voice.sh [main.mp3] [cta.mp3]
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN=${1:-assets/vo_takes/main.mp3}
CTA=${2:-assets/vo_takes/cta.mp3}
TARGET=${TARGET:-58.8}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

join() { # $1 = pause length → $TMP/joined.wav
  python3 -I scripts/tighten-pauses.py "$MAIN" "$TMP/main.wav" "$1"
  if [ -f "$CTA" ]; then
    ffmpeg -v error -y -i "$CTA" -af "silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse" -ar 44100 -ac 1 "$TMP/cta.wav"
    ffmpeg -v error -y -f lavfi -t "$1" -i anullsrc=r=44100:cl=mono "$TMP/gap.wav"
    ffmpeg -v error -y -i "$TMP/main.wav" -i "$TMP/gap.wav" -i "$TMP/cta.wav" -filter_complex "[0][1][2]concat=n=3:v=0:a=1" "$TMP/joined.wav"
  else
    cp "$TMP/main.wav" "$TMP/joined.wav"
  fi
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/joined.wav"
}

D1=$(join 0.12)
TEMPO=1.0
if python3 -c "import sys; sys.exit(0 if $D1 > $TARGET else 1)"; then
  TEMPO=$(python3 -c "print(round($D1 / $TARGET, 4))")
  if python3 -c "import sys; sys.exit(0 if $TEMPO > 1.08 else 1)"; then
    CUT=$(python3 -c "import math; print(math.ceil(($D1 / 1.08 - $TARGET) * 2.7))")
    echo "ERROR: ${D1}s of speech is too long for a 60 s video even at +8 % speed. Cut about $CUT words (target 150-164 words incl. CTA) and regenerate the voice." >&2
    exit 1
  fi
else
  # how much one step of pause length adds: measure with longer pauses
  D2=$(join 0.32)
  PER=$(python3 -c "print(($D2 - $D1) / 0.2)") # seconds per +1 s of every pause = number of pauses
  KEEP=$(python3 -c "print(round(0.12 + ($TARGET - $D1) / max($PER, 1), 3))")
  if python3 -c "import sys; sys.exit(0 if $KEEP > 0.45 else 1)"; then
    ADD=$(python3 -c "import math; print(math.ceil(($TARGET - $D1 - $PER * 0.33) * 2.7))")
    echo "ERROR: ${D1}s of speech is too short for a 60 s video (pauses would get longer than 0.45 s). Add about $ADD words — a 'Rate mal' moment or another strange fact (target 150-164 words) — and regenerate the voice." >&2
    exit 1
  fi
  D1=$(join "$KEEP")
  echo "pauses stretched to ${KEEP}s"
fi
ffmpeg -v error -y -i "$TMP/joined.wav" -af "atempo=${TEMPO},loudnorm=I=-14:TP=-1.5:LRA=11" -ar 44100 -b:a 192k assets/voiceover.mp3
FINAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3)
echo "joined ${D1}s -> atempo ${TEMPO} -> assets/voiceover.mp3 ${FINAL}s (target ${TARGET}s; video = exactly 60 s)"
