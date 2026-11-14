# #82 Induktionsherd — own sounds (synthesized, see make-sfx.py helpers)

# rolling boil: many small bubble pops (short resonant blips with rising pitch)
# over a low watery rumble — 14 s, looped/trimmed by `dur`
D = 14.0
t = t_of(D)
x = 0.35 * svf(noise(D), 380, q=0.7, mode="lp")
x += 0.12 * svf(noise(D), 1200, q=1.2, mode="bp")
for c in rng.uniform(0.0, D - 0.1, 900):
    i = int(c * 44100)
    n = min(len(t) - i, 2400)
    tt = np.arange(n) / 44100
    f0 = rng.uniform(250, 900)
    f = f0 * (1 + tt * 18)
    ph = 2 * np.pi * np.cumsum(f) / 44100
    x[i : i + n] += rng.uniform(0.15, 0.6) * np.sin(ph) * np.exp(-tt * rng.uniform(45, 90))
write("blubbern", svf(x, 90, q=0.7, mode="hp"))

# the hob's high coil whine: a thin, slightly wobbling high sine with a faint
# second partial (kept audible on phones — the real one is near 20 kHz)
D = 3.0
t = t_of(D)
f = 7400 + 60 * np.sin(2 * np.pi * 5.5 * t)
ph = 2 * np.pi * np.cumsum(f) / 44100
y = np.sin(ph) + 0.25 * np.sin(2 * ph * 1.003)
fd = np.minimum(1, t / 0.25) * np.minimum(1, (D - t) / 0.6)
write("pfeifen", y * fd * (0.8 + 0.2 * np.sin(2 * np.pi * 9 * t)))
