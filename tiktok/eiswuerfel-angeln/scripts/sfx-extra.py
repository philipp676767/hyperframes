# Per-video sound effects for #96 Eiswürfel angeln (synthesized, no samples).
# Helpers from make-sfx.py: t_of noise sine svf env write rng np

SR = 44100

# platsch — the cube rips out of the cola: a wet splash + falling droplets
t = t_of(0.8)
body = svf(noise(0.8), 900, q=0.7, mode="bp") * env(t, 0.005, 0.16)
hiss = svf(noise(0.8), 4200, q=0.6, mode="hp") * env(t, 0.01, 0.3) * 0.5
drops = np.zeros_like(t)
for c in rng.uniform(0.12, 0.65, 7):
    i = int(c * SR)
    n = min(len(t) - i, 2400)
    tt = np.arange(n) / SR
    f = rng.uniform(900, 1800)
    drops[i : i + n] += rng.uniform(0.2, 0.45) * np.sin(2 * np.pi * (f + 3000 * tt) * tt) * np.exp(-tt * 60)
write("platsch", body + hiss + drops)

# klirr — ice cube clinking against glass: bright inharmonic partials, fast decay
t = t_of(0.9)
x = np.zeros_like(t)
for hit, amp in ((0.0, 1.0), (0.11, 0.55)):
    i = int(hit * SR)
    tt = t[: len(t) - i]
    s = np.zeros_like(tt)
    for f, d, a in ((2630, 9, 1.0), (4120, 13, 0.6), (5870, 18, 0.45), (7350, 24, 0.3), (1480, 7, 0.35)):
        s += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * d)
    s += svf(noise(len(tt) / SR), 6000, q=0.7, mode="hp")[: len(tt)] * np.exp(-tt * 120) * 0.6
    x[i:] += amp * s
write("klirr", x)

# knister — water freezing / ice crackling: sparse tiny ticks, rising density
t = t_of(1.3)
x = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 1.2, 46)):
    i = int(c * SR)
    n = min(len(t) - i, 160)
    x[i : i + n] += rng.uniform(0.3, 1.0) * rng.choice([-1, 1]) * np.exp(-np.arange(n) / 18)
x = svf(x, 2600, q=0.7, mode="hp") * env(t, 0.02, 0.9)
write("knister", x)
