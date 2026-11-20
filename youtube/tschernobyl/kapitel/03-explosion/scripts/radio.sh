#!/usr/bin/env bash
# Archive voice (O-Ton) for documentary-style quotes: makes a clean
# ElevenLabs take sound like a 1960s–90s radio / TV / phone recording —
# band-limited, a little compressed and saturated, with a faint hiss. Use
# for lines starting with `»` in script.txt (references/aufbau.md „The
# intro“, SKILL.md „Archive voice“).
#   bash scripts/radio.sh in.mp3 out.mp3 [funk|tv|telefon]
#     funk     (default) space / police radio: narrow, crunchy, more hiss
#     tv       old news broadcast: a bit wider and cleaner
#     telefon  phone call: narrow, no hiss
set -euo pipefail
IN=${1:?usage: radio.sh in.mp3 out.mp3 [funk|tv|telefon]}
OUT=${2:?usage: radio.sh in.mp3 out.mp3 [funk|tv|telefon]}
MODE=${3:-funk}
case "$MODE" in
  funk) BAND="highpass=f=400,lowpass=f=3000"; HISS=0.012; DRIVE=4 ;;
  tv) BAND="highpass=f=180,lowpass=f=5500"; HISS=0.004; DRIVE=2 ;;
  telefon) BAND="highpass=f=350,lowpass=f=3200"; HISS=0; DRIVE=3 ;;
  *) echo "unknown mode $MODE" >&2; exit 1 ;;
esac
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
ffmpeg -v error -y -i "$IN" -f lavfi -t "$DUR" -i "anoisesrc=color=pink:amplitude=$HISS:seed=7" \
  -filter_complex "[0:a]aformat=channel_layouts=mono,$BAND,acompressor=threshold=-20dB:ratio=4:attack=5:release=60,volume=${DRIVE}dB,asoftclip=type=tanh,$BAND[v];[1:a]$BAND[n];[v][n]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5[o]" \
  -map "[o]" -ar 44100 -ac 1 -b:a 192k "$OUT"
echo "$OUT ($MODE)"
