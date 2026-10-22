#!/usr/bin/env bash
# Build assets/voiceover.mp3 from the raw ElevenLabs take (whole script incl.
# the per-video CTA): shorten pauses, append an extra CTA take only if
# assets/vo_takes/cta.mp3 exists (old episodes), speed up (max 10 %,
# pitch kept) towards TARGET seconds of speech, loudness -14 LUFS. The video
# adds ~1.2 s after the last word, so TARGET 43.8 ≈ a 45 s video. Refuses to
# write a voice that would put the video outside 40-50 s.
#   bash scripts/prepare-voice.sh [main.mp3] [cta.mp3]
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN=${1:-assets/vo_takes/main.mp3}
CTA=${2:-assets/vo_takes/cta.mp3}
TARGET=${TARGET:-43.8}
MIN=38.8 # speech for a 40 s video
MAX=48.8 # speech for a 50 s video
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# cut every pause (found at -30 dB) down to PAUSE s; Jan breathes ~0.5 s between phrases
python3 -I scripts/tighten-pauses.py "$MAIN" "$TMP/main.wav" "${PAUSE:-0.12}"
if [ -f "$CTA" ]; then
  ffmpeg -v error -y -i "$CTA" -af "silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse" -ar 44100 -ac 1 "$TMP/cta.wav"
  ffmpeg -v error -y -f lavfi -t 0.5 -i anullsrc=r=44100:cl=mono "$TMP/gap.wav"
  ffmpeg -v error -y -i "$TMP/main.wav" -i "$TMP/gap.wav" -i "$TMP/cta.wav" -filter_complex "[0][1][2]concat=n=3:v=0:a=1" "$TMP/joined.wav"
else
  cp "$TMP/main.wav" "$TMP/joined.wav"
fi

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/joined.wav")
TEMPO=$(python3 -c "print(min(1.10, max(1.0, $DUR / $TARGET)))")
FINAL=$(python3 -c "print(round($DUR / $TEMPO, 1))")
echo "joined ${DUR}s -> atempo ${TEMPO} -> ${FINAL}s of speech"
if python3 -c "import sys; sys.exit(0 if $FINAL > $MAX else 1)"; then
  echo "ERROR: ${FINAL}s of speech makes the video longer than 50 s. Shorten the script (target 110-122 words incl. CTA, max 128) and regenerate the voice." >&2
  exit 1
fi
if python3 -c "import sys; sys.exit(0 if $FINAL < $MIN else 1)"; then
  echo "ERROR: ${FINAL}s of speech makes the video shorter than 40 s. Add a short beat (target 110-122 words incl. CTA, min 105) and regenerate the voice." >&2
  exit 1
fi
ffmpeg -v error -y -i "$TMP/joined.wav" -af "atempo=${TEMPO},loudnorm=I=-14:TP=-1.5:LRA=11" -ar 44100 -b:a 192k assets/voiceover.mp3
echo "assets/voiceover.mp3: $(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3)s"
