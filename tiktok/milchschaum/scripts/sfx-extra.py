# Per-video sound effects (helpers from make-sfx.py: t_of noise sine svf env write rng np)
# #74 Milchschaum: "blubb" — a cluster of milk-foam bubbles bursting: each pop is a
# tiny damped sine whose pitch jumps up as the film tears, plus a wet click.
t = t_of(0.9)
x = np.zeros_like(t)
for c in sorted(rng.uniform(0.0, 0.7, 14)):
    i = int(c * 44100)
    n = min(len(t) - i, 4000)
    k = np.arange(n) / 44100
    f0 = rng.uniform(500, 1400)
    f = f0 * (1 + 1.6 * k / 0.02)
    ph = 2 * np.pi * np.cumsum(f) / 44100
    amp = rng.uniform(0.35, 1.0) * (1 - 0.6 * c)
    x[i : i + n] += amp * np.sin(ph) * np.exp(-k / 0.012)
    m = min(n, 160)
    x[i : i + m] += 0.3 * amp * rng.uniform(-1, 1, m) * np.exp(-np.arange(m) / 25)
write("blubb", svf(x, 300, q=0.7, mode="hp"))
