# Per-video sound effects (see the template comment in the skill):
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np

# #58 Deo: an aerosol can — the actuator click, then a bright, breathy hiss
# that swells, holds and tails off (high-passed noise with a slow flutter).
dur = 1.3
t = t_of(dur)
click = np.zeros_like(t)
n = 260
click[:n] = np.exp(-np.arange(n) / 25) * np.sin(2 * np.pi * 2300 * np.arange(n) / 44100)
hiss = svf(noise(dur), 5200, q=0.6, mode="hp") + 0.45 * svf(noise(dur), 2600, q=1.2, mode="bp")
shape = np.clip((t - 0.03) / 0.08, 0, 1) * np.clip((dur - t) / 0.45, 0, 1)
flutter = 1 + 0.12 * np.sin(2 * np.pi * 9 * t)
write("spruehen", 0.9 * click + hiss * shape * flutter)
