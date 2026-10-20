#!/usr/bin/env bash
# Build assets/voiceover.mp3 from the raw ElevenLabs take + the stock CTA line:
# shorten pauses, append "Folg mir, um mehr zu lernen.", speed up (max 10 %,
# pitch kept) towards TARGET seconds of speech, loudness -14 LUFS. The video
# adds ~1.2 s after the last word, so TARGET 49 ≈ a 50 s video. Refuses to
# write a voice that would make the video longer than 60 s.
#   bash scripts/prepare-voice.sh [main.mp3] [cta.mp3]
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN=${1:-assets/vo_takes/main.mp3}
CTA=${2:-assets/vo_takes/cta.mp3}
TARGET=${TARGET:-49}
MAX=58.8
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

ffmpeg -v error -y -i "$MAIN" -af "silenceremove=stop_periods=-1:stop_duration=0.25:stop_threshold=-35dB:stop_silence=0.22,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse" -ar 44100 -ac 1 "$TMP/main.wav"
ffmpeg -v error -y -i "$CTA" -af "silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse" -ar 44100 -ac 1 "$TMP/cta.wav"
ffmpeg -v error -y -f lavfi -t 0.5 -i anullsrc=r=44100:cl=mono "$TMP/gap.wav"
ffmpeg -v error -y -i "$TMP/main.wav" -i "$TMP/gap.wav" -i "$TMP/cta.wav" -filter_complex "[0][1][2]concat=n=3:v=0:a=1" "$TMP/joined.wav"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/joined.wav")
TEMPO=$(python3 -c "print(min(1.10, max(1.0, $DUR / $TARGET)))")
FINAL=$(python3 -c "print(round($DUR / $TEMPO, 1))")
echo "joined ${DUR}s -> atempo ${TEMPO} -> ${FINAL}s of speech"
if python3 -c "import sys; sys.exit(0 if $FINAL > $MAX else 1)"; then
  echo "ERROR: ${FINAL}s of speech makes the video longer than 60 s. Shorten the script (target 120-135 words, max 150) and regenerate the voice." >&2
  exit 1
fi
ffmpeg -v error -y -i "$TMP/joined.wav" -af "atempo=${TEMPO},loudnorm=I=-14:TP=-1.5:LRA=11" -ar 44100 -b:a 192k assets/voiceover.mp3
echo "assets/voiceover.mp3: $(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voiceover.mp3)s"
