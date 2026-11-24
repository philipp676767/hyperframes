#!/usr/bin/env bash
# Build assets/bgm.mp3: the stock calm bed (assets/vo_takes/bgm-ruhig.mp3) cut to
# the voiceover length + outro tail, faded in/out and ducked under the voice.
# Run after prepare-voice.sh, before sync-html.mjs.
#   bash scripts/prepare-music.sh            BGM_DB=-5 (bed level vs. its -20 LUFS master)
set -euo pipefail
cd "$(dirname "$0")/.."
BED=${1:-assets/vo_takes/bgm-ruhig.mp3}
VO=assets/voiceover.mp3
BGM_DB=${BGM_DB:--5}
VO_DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VO")
# Loop ending (a "> …" line in script.txt, HF_LOOP_START in words.js): the
# video stops right after the last word, so the bed only dips at the very end
# instead of fading out — the restart must not feel like a new video.
if grep -q "HF_LOOP_START = [0-9]" assets/words.js 2>/dev/null; then TAIL=0.6 FADE=0.35 FADE_IN=0.3; else TAIL=1.6 FADE=2.0 FADE_IN=1.5; fi
DUR=$(python3 -c "print(round($VO_DUR + $TAIL, 2))")
FADE_OUT=$(python3 -c "print(round($DUR - $FADE, 2))")

# sidechain: the voice pushes the bed down ~4-5 dB while it speaks, eases back in pauses
ffmpeg -v error -y -i "$BED" -i "$VO" -filter_complex "\
[0:a]atrim=0:${DUR},asetpts=PTS-STARTPTS,volume=${BGM_DB}dB,afade=t=in:st=0:d=${FADE_IN},afade=t=out:st=${FADE_OUT}:d=${FADE}[bed];\
[1:a]aformat=channel_layouts=stereo,apad=whole_dur=${DUR}[sc];\
[bed][sc]sidechaincompress=threshold=0.1:ratio=2.5:attack=30:release=600:makeup=1[out]" \
  -map "[out]" -t "$DUR" -ar 44100 -b:a 192k assets/bgm.mp3
echo "assets/bgm.mp3: ${DUR}s at ${BGM_DB} dB, ducked under the voice"
