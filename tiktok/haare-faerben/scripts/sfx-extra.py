# Per-video sound effects — the topic's own sounds, synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np

# #86 Haare färben: a thick blob of hair dye slapping onto the hair — a wet,
# low "splat" (lowpassed noise burst with a falling resonance) + a few tiny
# droplet ticks after it.
t = t_of(0.55)
body = svf(noise(0.55), 900, q=1.6, mode="lp") * env(t, 0.004, 0.09)
f = 420 * np.exp(-t * 9) + 90
thump = np.sin(2 * np.pi * np.cumsum(f) / 44100) * env(t, 0.002, 0.07)
drops = np.zeros_like(t)
for c in rng.uniform(0.08, 0.4, 5):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n) / 44100
    drops[i : i + n] += 0.25 * np.sin(2 * np.pi * rng.uniform(900, 1600) * k * (1 + 3 * k)) * np.exp(-k * 60)
write("splat", 1.2 * body + 0.9 * thump + drops)
