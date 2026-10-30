# Speak the last sentence of a voice take faster: "Folge für mehr Wissen."
# closes every video and should rush by (user's wish, 2026-10-30). The tail is
# everything after the last pause (found at -30 dB, ≥ 0.08 s) that starts in
# the final 3 s; it gets atempo FACTOR on top (pitch kept). If no such pause
# is found the take is copied unchanged.
#   python3 -I scripts/fast-tail.py in.wav out.wav [FACTOR]
import re, shutil, subprocess, sys
src, out = sys.argv[1], sys.argv[2]
factor = float(sys.argv[3]) if len(sys.argv) > 3 else 1.3
log = subprocess.run(["ffmpeg", "-v", "info", "-i", src, "-af", "silencedetect=n=-30dB:d=0.08", "-f", "null", "-"], capture_output=True, text=True).stderr
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], capture_output=True, text=True).stdout)
# a silence that runs to the very end is trailing room, not the pause before the tail
pauses = [(s, e) for s, e in zip(starts, ends) if e < dur - 0.3]
cut = next(((s, e) for s, e in reversed(pauses) if 0.5 <= dur - e <= 3.0), None)
if not cut or factor <= 1.0:
    print("fast-tail: no last-sentence pause found — take unchanged")
    shutil.copy(src, out)
    sys.exit(0)
s, e = cut
f = (
    f"[0]atrim=0:{e:.3f},asetpts=PTS-STARTPTS[a];"
    f"[0]atrim={e:.3f},asetpts=PTS-STARTPTS,atempo={factor}[b];"
    "[a][b]concat=n=2:v=0:a=1[o]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", f, "-map", "[o]", "-ar", "44100", "-ac", "1", out], check=True)
print(f"fast-tail: last sentence {dur - e:.2f}s → {(dur - e) / factor:.2f}s (x{factor})")
