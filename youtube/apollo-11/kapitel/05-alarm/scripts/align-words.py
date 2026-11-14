# Word timings for assets/voiceover.mp3: Whisper word timestamps, snapped onto
# the script's own tokens (so captions keep the script's spelling), with the
# caption flags of scripts/words-lib.mjs (hl = keyword, br = phrase / sentence end).
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
lines = [l for l in script.strip().splitlines() if l.strip()]
TAG = r"\[[^\]\n]*\]"  # [excited] … are delivery tags for the voice, not words


def tokenize(text):
    """Mirror of scripts/words-lib.mjs tokenize(): words + caption flags."""
    out = []
    for r in re.sub(TAG, " ", text).split():
        if r in ("–", "—"):
            if out:
                out[-1]["br"] = max(out[-1].get("br", 0), 1)
            continue
        hl = bool(re.fullmatch(r"\*.*\*[.,:;!?…]*", r))
        br = 2 if re.search(r"[.!?…]\*?$", r) else 1 if re.search(r"[,:;]\*?$", r) else 0
        w = re.sub(r"(?<!\d)[.,]|[.,](?!\d)|[:;!?…„“\"]", "", r.replace("*", ""))
        if not w:
            continue
        o = {"w": w}
        if hl:
            o["hl"] = True
        if br:
            o["br"] = br
        out.append(o)
    return out


toks = tokenize(script)
tokens = [t["w"] for t in toks]
script = re.sub(TAG, " ", script).replace("*", "")
norm = lambda s: re.sub(r"[^a-zäöüß0-9]", "", s.lower())

model = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(samples, language="de", word_timestamps=True, initial_prompt=script)
heard = [w for s in segs for w in s.words]
if len(heard) < len(tokens) // 2:  # the script prompt sometimes makes Whisper return nothing: retry without it
    segs, _ = model.transcribe(samples, language="de", word_timestamps=True)
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

words = []
for tk, (st, en) in zip(toks, times):
    w = dict(tk)
    w["start"], w["end"] = round(st, 3), round(en, 3)
    words.append({k: w[k] for k in ("w", "start", "end", "hl", "br") if k in w})
# the CTA line exists only in the end chapter (last line with „Folge für mehr Wissen.“)
cta_len = len(tokenize(lines[-1])) if re.search("folge für mehr wissen", lines[-1], re.I) else 0
(root / "assets" / "words.js").write_text(
    "window.HF_WORDS = " + json.dumps(words, ensure_ascii=False) + ";\n"
    + f"window.HF_CTA_START = {len(words) - cta_len if cta_len else 'null'};\n"
    + f"window.HF_HOOK_LEN = {len(tokenize(lines[0]))};\n",
    encoding="utf8",
)
print(f"{len(words)} words, last ends {words[-1]['end']:.2f}s; interpolated: {missing}")
