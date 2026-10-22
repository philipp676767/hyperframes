# Synthesize the series' sound-effect kit into assets/sfx/*.wav (mono 44.1 kHz,
# peak -3 dBFS). Pure numpy and seeded, so every project gets the identical kit
# and nothing licensed has to be shipped. build-sfx.mjs runs this when the kit
# is missing.
#   python3 scripts/make-sfx.py [out_dir]
import sys, wave
from pathlib import Path

import numpy as np

SR = 44100
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "assets" / "sfx"
out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def t_of(dur):
    return np.arange(int(SR * dur)) / SR


def noise(dur):
    return rng.standard_normal(int(SR * dur))


def sine(freq, t):
    # freq may be an array (sweep): integrate the phase
    f = np.broadcast_to(freq, t.shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def svf(x, cutoff, q=0.7, mode="bp"):
    # time-varying state-variable filter (cutoff may be an array)
    c = np.broadcast_to(cutoff, x.shape)
    f = 2 * np.sin(np.pi * np.clip(c, 20, SR / 6) / SR)
    damp = 1 / q
    low = band = 0.0
    y = np.empty_like(x)
    for i in range(len(x)):
        low += f[i] * band
        high = x[i] - low - damp * band
        band += f[i] * high
        y[i] = band if mode == "bp" else low if mode == "lp" else high
    return y


def env(t, attack, decay):
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-np.maximum(0, t - attack) / decay)


def fade(x, a=0.004, b=0.02):
    n = len(x)
    ia, ib = int(SR * a), int(SR * b)
    x[:ia] *= np.linspace(0, 1, ia)
    x[n - ib :] *= np.linspace(1, 0, ib)
    return x


def write(name, x, peak_db=-3.0):
    x = fade(x.astype(np.float64))
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    pcm = (x * 32767).astype("<i2")
    with wave.open(str(out / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# whoosh: band-passed noise sweeping up then down, peak at 0.22 s (= the cut)
t = t_of(0.55)
shape = np.where(t < 0.22, (t / 0.22) ** 2, np.exp(-(t - 0.22) / 0.11))
cut = 350 + 2600 * np.where(t < 0.22, t / 0.22, np.exp(-(t - 0.22) / 0.15))
write("whoosh", svf(noise(0.55), cut, q=1.4) * shape)

# hit: hook-title impact = low thump + bright noise snap
t = t_of(0.6)
thump = sine(55 + 110 * np.exp(-t / 0.05), t) * env(t, 0.003, 0.16)
snap = svf(noise(0.6), 3200, q=0.8) * env(t, 0.001, 0.05)
write("hit", thump + 0.5 * snap)

# punch: soft low tock under highlighted words
t = t_of(0.28)
write("punch", sine(70 + 90 * np.exp(-t / 0.03), t) * env(t, 0.002, 0.07) + 0.15 * svf(noise(0.28), 1800) * env(t, 0.001, 0.02))

# pop: bubbly pitch drop (pop-ins, CTA pills)
t = t_of(0.16)
write("pop", sine(300 + 900 * np.exp(-t / 0.018), t) * env(t, 0.002, 0.045))

# blip: two quick tones for a label appearing
t = t_of(0.18)
f = np.where(t < 0.07, 1250, 1870)
write("blip", sine(f, t) * (env(t, 0.002, 0.03) + np.where(t >= 0.07, env(t - 0.07, 0.002, 0.04), 0)) * 0.8)

# click: the follow-button tap
t = t_of(0.06)
write("click", svf(noise(0.06), 4200, q=2.0) * env(t, 0.0005, 0.006) + 0.6 * sine(2100, t) * env(t, 0.0005, 0.01))

# ding: little bell for the payoff ("Du hast gerade X gebaut") and the follow flip
t = t_of(1.4)
bell = sum(a * sine(1318.5 * r, t) * np.exp(-t / d) for a, r, d in [(1, 1, 0.5), (0.5, 2.76, 0.22), (0.25, 5.4, 0.1), (0.3, 2.0, 0.35)])
write("ding", bell * np.minimum(1, t / 0.002))

# boing: cartoon spring (something jumps / bounces in)
t = t_of(0.5)
f = 180 + 260 * (1 - np.exp(-t / 0.06)) + 60 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.2)
write("boing", sine(f, t) * env(t, 0.004, 0.18))

# wow: rising sparkle arpeggio (a magic / "it works" moment)
t = t_of(0.95)
wow = np.zeros_like(t)
for i, f0 in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
    s = np.maximum(0, t - i * 0.08)
    wow += sine(f0, t) * np.where(t >= i * 0.08, env(s, 0.003, 0.22), 0)
wow += 0.12 * svf(noise(0.95), 7000, q=0.9) * env(t, 0.05, 0.3)
write("wow", wow)

# klack: mechanical clunk (latch, brake, door)
t = t_of(0.22)
write("klack", svf(noise(0.22), 420, q=6) * env(t, 0.001, 0.035) + 0.4 * svf(noise(0.22), 2600, q=3) * env(t, 0.0005, 0.01))

# slowmo: deep "bwooom" as time slows down (falling pitch + airy swell)
t = t_of(1.1)
sweep = sine(190 * np.exp(-t / 0.45) + 45, t) * env(t, 0.02, 0.5)
air = svf(noise(1.1), 900 * np.exp(-t / 0.4) + 150, q=0.8, mode="lp") * env(t, 0.05, 0.4)
write("slowmo", sweep + 0.6 * air)

# zisch: hiss loop (gas, steam, air) — build-sfx trims it to the cue length
t = t_of(4.0)
write("zisch", svf(noise(4.0), 5200, q=0.6, mode="hp") * (0.85 + 0.15 * np.sin(2 * np.pi * 7 * t)), peak_db=-6)

# brumm: motor / compressor / transformer hum loop
t = t_of(4.0)
hum = sum(a * sine(50 * k, t) for k, a in [(1, 1), (2, 0.6), (3, 0.35), (4, 0.2), (6, 0.1)])
write("brumm", hum * (0.9 + 0.1 * np.sin(2 * np.pi * 3.3 * t)) + 0.08 * svf(noise(4.0), 300, q=0.7, mode="lp"), peak_db=-6)

# surr: high electric buzz (current, heating wire, lamp)
t = t_of(4.0)
write("surr", svf(np.sign(sine(120, t)) * 0.5 + 0.1 * noise(4.0), 900, q=1.2), peak_db=-6)

# rauschen: wind / water / airflow loop
t = t_of(4.0)
write("rauschen", svf(noise(4.0), 700 + 300 * np.sin(2 * np.pi * 0.4 * t), q=0.5) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)), peak_db=-6)

print("sfx kit ->", out, sorted(p.stem for p in out.glob("*.wav")))
