#!/usr/bin/env bash
# joins p00..pNN.mp3 with 0.35 s silence into ../main.mp3
set -e
cd "$(dirname "$0")"
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
