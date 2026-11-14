# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of noise sine svf env write rng np.
# eiknall: an egg bursting — a sharp crack, a low thump and a wet splat.
t = t_of(0.9)
crack = svf(noise(0.9), 4200, q=0.9, mode="hp") * env(t, 0.001, 0.035)
thump = sine(70 * np.exp(-t * 6), t) * env(t, 0.004, 0.16)
splat = svf(noise(0.9), 900, q=1.4, mode="bp") * env(t, 0.01, 0.28)
drops = np.zeros_like(t)
for c in rng.uniform(0.12, 0.6, 7):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    drops[i : i + n] += rng.uniform(0.2, 0.5) * np.exp(-np.arange(n) / 160) * np.sin(np.arange(n) * rng.uniform(0.15, 0.3))
write("eiknall", 1.1 * crack + 1.6 * thump + 1.0 * splat + 0.6 * svf(drops, 1500, q=0.8, mode="bp"))
