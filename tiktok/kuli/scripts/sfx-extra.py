# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# "pfeifen": air squeezed through the tiny hole of a stuck pen cap — a breathy
# band of noise with a thin whistle tone that rises with the inhale and falls.
dur = 1.3
t = t_of(dur)
breath = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
air = svf(noise(dur), 2600, q=1.6, mode="bp") * 0.9 + svf(noise(dur), 6500, q=0.7, mode="hp") * 0.35
f = 2150 + 380 * breath + 25 * np.sin(2 * np.pi * 5.5 * t)
tone = np.sin(2 * np.pi * np.cumsum(f) / 44100) * (0.28 + 0.1 * np.sin(2 * np.pi * 7 * t))
write("pfeifen", (air + tone) * breath)

# "knacken": teeth biting a plastic cap — a few short, bright plastic clicks
# with small resonances, then a soft creak.
dur = 0.55
t = t_of(dur)
x = np.zeros_like(t)
for c, a in [(0.0, 1.0), (0.07, 0.7), (0.16, 0.85), (0.29, 0.55)]:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n) / 44100
    burst = rng.uniform(-1, 1, n) * np.exp(-k / 0.004)
    ring = np.sin(2 * np.pi * rng.uniform(1700, 3200) * k) * np.exp(-k / 0.012) * 0.6
    x[i : i + n] += a * (burst + ring)
creak = svf(noise(dur), 900, q=4.0, mode="bp") * env(t, 0.2, 0.25) * 0.25
write("knacken", svf(x, 1200, q=0.7, mode="hp") + creak)
