# Word timings for assets/voiceover.mp3: Whisper word timestamps, snapped onto
# the script's own tokens (so captions keep the script's spelling).
#   python3 scripts/align-words.py
import difflib, json, re, subprocess, sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parent.parent
audio = root / "assets" / "voiceover.mp3"
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(audio), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
samples = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

script = (root / "script.txt").read_text(encoding="utf8")
# [excited], [whispers] … are delivery tags for the voice (eleven_v3), not words
script = re.sub(r"\[[^\]\n]*\]", " ", script)
# *Wort* marks a highlighted keyword; the voice and Whisper get the plain text
tokens = [t for t in script.split() if t not in ("–", ">")]
marked = [bool(re.fullmatch(r"\*.*\*[.,:!?]*", t)) for t in tokens]
tokens = [t.replace("*", "") for t in tokens]
lines = [l for l in script.strip().splitlines() if l.strip()]
script = script.replace("*", "").replace("\n>", "\n")
norm = lambda s: re.sub(r"[^a-zäöüß0-9]", "", s.lower())

model = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(samples, language="de", word_timestamps=True, initial_prompt=script)
heard = [w for s in segs for w in s.words]

a = [norm(t) for t in tokens]
b = [norm(w.word) for w in heard]
times = [None] * len(tokens)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            times[i1 + k] = (heard[j1 + k].start, heard[j1 + k].end)
    elif tag == "replace":  # merged/split words: spread the heard span evenly
        s0, s1 = heard[j1].start, heard[j2 - 1].end
        n = i2 - i1
        for k in range(n):
            times[i1 + k] = (s0 + (s1 - s0) * k / n, s0 + (s1 - s0) * (k + 1) / n)
missing = [tokens[i] for i, t in enumerate(times) if t is None]
for i, t in enumerate(times):  # interpolate anything Whisper skipped
    if t is None:
        prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
        nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev + 0.3)
        times[i] = (prev, max(prev + 0.05, nxt))

# strip punctuation, but keep a dot / comma inside a number ("60.000-mal", "1,5")
words = [{"w": re.sub(r"(?<!\d)[.,]|[.,](?!\d)|[:!?]", "", t), "start": round(s, 3), "end": round(e, 3)} for t, (s, e) in zip(tokens, times)]
for w, hl in zip(words, marked):
    if hl:
        w["hl"] = True
# The CTA is the last line (its first word drives the CTA buttons); an
# optional final "> …" line is the loop bridge into the hook.
count = lambda l: len([t for t in l.split() if t not in ("–", ">")])
loop = lines[-1].lstrip().startswith(">")
loop_len = count(lines[-1]) if loop else 0
cta_len = count(lines[-2] if loop else lines[-1])
(root / "assets" / "words.js").write_text(
    "window.HF_WORDS = " + json.dumps(words, ensure_ascii=False) + ";\n"
    + f"window.HF_CTA_START = {len(words) - loop_len - cta_len};\n"
    + f"window.HF_LOOP_START = {len(words) - loop_len if loop else 'null'};\n",
    encoding="utf8",
)
print(f"{len(words)} words, last ends {words[-1]['end']:.2f}s; interpolated: {missing}")
