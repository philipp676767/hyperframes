#!/usr/bin/env bash
# Final loudness pass on the rendered MP4: the render's mixer lowers the level
# when voice + music bed play together (≈ -18 LUFS), so bring the finished
# video to -14 LUFS (TikTok / Reels) without re-encoding the picture.
#   bash scripts/finish-audio.sh renders/<slug>.mp4   -> renders/<slug>-final.mp4
set -euo pipefail
IN=${1:?usage: finish-audio.sh renders/<slug>.mp4}
OUT=${IN%.mp4}-final.mp4
ffmpeg -v error -y -i "$IN" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "$OUT: $(ffmpeg -hide_banner -i "$OUT" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | xargs)"
