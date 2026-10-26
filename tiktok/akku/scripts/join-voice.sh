#!/usr/bin/env bash
# Joins the voice chunks assets/vo_takes/parts/p*.mp3 (sorted by name) with
# 0.35 s silence into assets/vo_takes/main.mp3 (SKILL.md step 3, 429 fallback).
#   bash scripts/join-voice.sh   (from the project dir)
set -e
cd "$(dirname "$0")/../assets/vo_takes/parts"
ffmpeg -v error -y -f lavfi -t 0.35 -i anullsrc=r=44100:cl=mono sil.wav
: > list.txt
for f in $(ls p*.mp3 | sort); do
  ffmpeg -v error -y -i "$f" -ar 44100 -ac 1 "${f%.mp3}.wav"
  echo "file '${f%.mp3}.wav'" >> list.txt
  echo "file 'sil.wav'" >> list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c:a libmp3lame -q:a 2 ../main.mp3
rm -f p*.wav sil.wav list.txt
ffprobe -v error -show_entries format=duration -of csv=p=0 ../main.mp3
