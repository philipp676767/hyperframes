# Per-video sound effects of #93 (Handy gegen Klobrille) — synthesized with
# the helpers of make-sfx.py (t_of noise sine svf env fade write rng np).

# A toilet flush: a sharp valve clack, then a rushing, swirling water roar
# that rises fast and gurgles down, with a low swirl wobble.
d = 2.2
t = t_of(d)
n = noise(d)
shape = np.minimum(1.0, t / 0.18) * np.exp(-np.maximum(0, t - 0.5) / 0.7)
rush = svf(n, 1400, q=0.6, mode="bp") * 0.9 + svf(n, 420, q=0.9, mode="lp") * 0.8
swirl = 0.65 + 0.35 * np.sin(2 * np.pi * (3.2 + 1.5 * t) * t)
gurgle = np.zeros_like(t)
for c in rng.uniform(0.6, 2.0, 18):
    i = int(c * 44100)
    m = min(len(t) - i, 2400)
    if m <= 0:
        continue
    f = rng.uniform(250, 520)
    tt = np.arange(m) / 44100
    gurgle[i : i + m] += np.sin(2 * np.pi * (f + 900 * tt) * tt) * np.exp(-tt / 0.03) * rng.uniform(0.3, 0.7)
clack = svf(noise(d), 2500, q=1.2, mode="bp") * env(t, 0.001, 0.03) * 1.6
write("spuelung", fade(rush * shape * swirl + 0.5 * gurgle * shape + clack))
