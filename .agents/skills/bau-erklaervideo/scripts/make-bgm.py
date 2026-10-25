"""Synthesize the series' calm background bed -> assets/bgm-ruhig.mp3.

Original, license-free and deterministic (seeded): soft pad, marimba-like
arpeggio, round bass and a whisper of shaker in C major at 84 BPM, ~80 s.
Every video reuses the same take (like the CTA line); rerun only to change it.
    python3 -I .claude/skills/bau-erklaervideo/scripts/make-bgm.py
"""

import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 84
BEAT = 60 / BPM
BARS = 28
OUT = Path(__file__).resolve().parent.parent / "assets" / "bgm-ruhig.mp3"
rng = np.random.default_rng(84)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# I - vi - IV - V(sus) in C, two bars each; MIDI voicings
CHORDS = [
    {"root": 36, "pad": [55, 60, 64, 71], "arp": [72, 76, 79, 83]},  # Cmaj7
    {"root": 33, "pad": [55, 60, 64, 69], "arp": [72, 76, 79, 81]},  # Am7
    {"root": 29, "pad": [57, 60, 64, 69], "arp": [72, 77, 81, 84]},  # Fmaj7
    {"root": 31, "pad": [55, 59, 62, 67], "arp": [74, 79, 83, 86]},  # G
]
total = int(BARS * 4 * BEAT * SR) + SR * 4
L = np.zeros(total)
R = np.zeros(total)


def add(sig, start, gl, gr):
    i = int(start * SR)
    n = min(len(sig), total - i)
    L[i : i + n] += sig[:n] * gl
    R[i : i + n] += sig[:n] * gr


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y


def pad_note(f, dur):
    t = np.arange(int((dur + 1.5) * SR)) / SR
    env = np.minimum(1, t / 0.9) * np.where(t < dur, 1, np.exp(-(t - dur) * 3))
    s = sum(
        np.sin(2 * np.pi * f * d * t + rng.random() * 6) + 0.25 * np.sin(4 * np.pi * f * d * t)
        for d in (0.997, 1.0, 1.003)
    )
    return s * env * (1 + 0.08 * np.sin(2 * np.pi * 0.2 * t))


def marimba(f, vel):
    t = np.arange(int(1.6 * SR)) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18)
    return s * np.minimum(1, t / 0.004) * vel


def bass(f, dur):
    t = np.arange(int((dur + 0.5) * SR)) / SR
    env = np.minimum(1, t / 0.03) * np.exp(-t * 0.9) * np.where(t < dur, 1, np.exp(-(t - dur) * 8))
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env


def shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    hp = noise - lowpass(noise, 5000)
    return hp * np.exp(-t * 45)


ARP_ORDER = [0, 1, 2, 3, 2, 1, 2, 3]
for bar in range(BARS):
    ch = CHORDS[(bar // 2) % 4]
    t0 = bar * 4 * BEAT
    section_b = 8 <= bar < 22
    if bar % 2 == 0:
        for n in ch["pad"]:
            add(pad_note(midi(n), 8 * BEAT), t0, 0.032, 0.032)
        add(bass(midi(ch["root"] + 12), 8 * BEAT - 0.1), t0, 0.1, 0.1)
    if bar >= 2:
        for k, idx in enumerate(ARP_ORDER):
            if not section_b and k % 2 == 1:
                continue  # sparse in the intro and outro
            vel = (0.3 if k % 2 == 0 else 0.21) * (0.85 + 0.3 * rng.random())
            pan = 0.35 + 0.3 * (idx / 3)
            add(marimba(midi(ch["arp"][idx]), vel), t0 + k * BEAT / 2, 1 - pan, pan)
    if section_b:
        for k in range(4):
            add(shaker(), t0 + (k + 0.5) * BEAT, 0.018, 0.024)

# soft room: convolve with a seeded decaying noise tail
ir_len = int(1.8 * SR)
tir = np.arange(ir_len) / SR
ir = rng.standard_normal((2, ir_len)) * np.exp(-tir * 3.2)
ir[:, : int(0.01 * SR)] = 0
nfft = 1 << int(np.ceil(np.log2(total + ir_len)))
wet = [np.fft.irfft(np.fft.rfft(ch, nfft) * np.fft.rfft(ir[i], nfft), nfft)[:total] for i, ch in enumerate((L, R))]
mix = np.stack([L + 0.012 * wet[0], R + 0.012 * wet[1]])

end = int((BARS * 4 * BEAT + 2.5) * SR)
mix = mix[:, :end]
fade = np.ones(mix.shape[1])
fi = int(2 * SR)
fo = int(4 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo) ** 2
mix *= fade
mix /= np.max(np.abs(mix)) / 0.8

with tempfile.TemporaryDirectory() as tmp:
    wav = Path(tmp) / "bgm.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix.T * 32767).astype("<i2").tobytes())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-20:TP=-2:LRA=11",
         "-ar", "44100", "-b:a", "192k", str(OUT)],
        check=True,
    )
print(f"{OUT}: {mix.shape[1] / SR:.1f}s", file=sys.stderr)
