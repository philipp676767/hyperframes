# Per-video sound effects for #32 Flugzeugfenster, synthesized with the
# helpers of make-sfx.py (t_of, noise, sine, svf, env, write, rng, np).

# reissen: aluminium skin under strain — a low metallic groan that bends
# upward, then a sharp tearing crack with a few rattling fragments
t = t_of(1.4)
f = 70 + 40 * t + 25 * np.sin(2 * np.pi * 3.1 * t)
ph = 2 * np.pi * np.cumsum(f) / 44100
groan = (np.sin(ph) + 0.5 * np.sin(2.01 * ph) + 0.3 * np.sin(3.7 * ph)) * env(t, 0.25, 0.6) * (t < 0.75)
groan = svf(groan + 0.15 * noise(1.4), 900, q=2.5, mode="bp")
crack = np.zeros_like(t)
i0 = int(0.62 * 44100)
n = len(t) - i0
crack[i0:] = noise(1.4)[:n] * np.exp(-np.arange(n) / 1800)
crack = svf(crack, 2400, q=0.7, mode="hp") * 1.6 + svf(crack, 180, q=0.9, mode="lp") * 2.2
rattle = np.zeros_like(t)
for c in rng.uniform(0.7, 1.25, 12):
    i = int(c * 44100)
    m = min(len(t) - i, 900)
    rattle[i : i + m] += rng.uniform(0.2, 0.6) * np.sin(2 * np.pi * rng.uniform(2500, 5200) * np.arange(m) / 44100) * np.exp(-np.arange(m) / 160)
write("reissen", 0.9 * groan + crack + 0.5 * rattle)

# pumpe: the test rig's hydraulic pump — a heavy thump + hiss per stroke,
# strokes getting faster (loop; build-sfx trims it to the cue's dur)
dur = 8.0
t = t_of(dur)
x = np.zeros_like(t)
tt = 0.0
k = 0
while tt < dur - 0.3:
    i = int(tt * 44100)
    m = min(len(t) - i, int(0.35 * 44100))
    a = np.arange(m) / 44100
    thump = np.sin(2 * np.pi * (55 + 30 * np.exp(-a * 30)) * a) * np.exp(-a * 14)
    hiss = svf(noise(0.35)[:m], 1800, q=0.8, mode="bp") * np.exp(-a * 9) * 0.5
    x[i : i + m] += thump + hiss
    k += 1
    tt += max(0.14, 0.62 * (0.82 ** k))
write("pumpe", x)
