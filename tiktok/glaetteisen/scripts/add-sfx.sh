#!/usr/bin/env bash
# Add a sound file the user hands over to this video (own sounds are normally
# synthesized in scripts/sfx-extra.py):
# trimmed, mono 44.1 kHz, max 5 s, peak -3 dBFS like the house kit, saved
# as assets/sfx-extra/<name>.wav. Then use it in beats.js SFX: { s: "<name>", at: T.x }.
#   bash scripts/add-sfx.sh popcorn path/or/https-url.mp3 [max_seconds]
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=${1:?usage: add-sfx.sh <name> <file|url> [max_seconds]}
SRC=${2:?usage: add-sfx.sh <name> <file|url> [max_seconds]}
MAX=${3:-5}
mkdir -p assets/sfx-extra
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
if [[ "$SRC" == http* ]]; then
  curl -sSL -o "$TMP/in" "$SRC"
  SRC="$TMP/in"
fi
ffmpeg -v error -y -i "$SRC" -af "silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:${MAX},afade=t=out:st=$(python3 -c "print(max(0, ${MAX} - 0.05))"):d=0.05" -ac 1 -ar 44100 "$TMP/a.wav"
PEAK=$(ffmpeg -hide_banner -i "$TMP/a.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB.*/\1/p')
GAIN=$(python3 -c "print(round(-3 - (${PEAK:-0}), 2))")
ffmpeg -v error -y -i "$TMP/a.wav" -af "volume=${GAIN}dB" -c:a pcm_s16le "assets/sfx-extra/${NAME}.wav"
echo "assets/sfx-extra/${NAME}.wav: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "assets/sfx-extra/${NAME}.wav")s, peak -3 dBFS"
