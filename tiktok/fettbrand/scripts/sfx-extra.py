# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# brutzeln: hot fat crackling — a bed of fine hiss plus dense random spits
# (short bright clicks), some louder pops, fading in and out over 4 s
D = 4.0
t = t_of(D)
spits = np.zeros_like(t)
for c in rng.uniform(0.0, D - 0.05, 260):
    i = int(c * 44100)
    n = min(len(t) - i, 160)
    spits[i : i + n] += rng.uniform(0.15, 1.0) ** 2 * np.exp(-np.arange(n) / rng.uniform(8, 30))
for c in rng.uniform(0.1, D - 0.2, 14):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    spits[i : i + n] += 1.4 * np.exp(-np.arange(n) / 120) * rng.uniform(-1, 1, n)
hiss = svf(noise(D), 5200, q=0.6, mode="hp") * 0.08
shape = np.minimum(1, t / 0.08) * np.minimum(1, (D - t) / 0.5)
write("brutzeln", (svf(spits, 2200, q=0.7, mode="hp") + hiss) * shape)

# wumm: a fireball igniting — a deep pressure thump, a falling body of
# low noise and a roaring tail of fire, 2.2 s
D = 2.2
t = t_of(D)
thump = sine(48 * np.exp(-t * 2.5) + 30, t) * env(t, 0.01, 0.35)
body = svf(noise(D), 180 + 500 * np.exp(-t * 3), q=0.9, mode="lp") * env(t, 0.02, 0.9)
roar = svf(noise(D), 900, q=0.5, mode="bp") * np.minimum(1, t / 0.15) * np.exp(-t * 1.6) * 0.5
crack = svf(noise(D), 3000, q=0.7, mode="hp") * env(t, 0.003, 0.06) * 0.6
write("wumm", 1.4 * thump + 1.6 * body + roar + crack)
