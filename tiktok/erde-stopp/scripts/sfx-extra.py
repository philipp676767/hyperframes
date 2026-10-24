# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. build-sfx.mjs runs this file.

# The Earth grinding to a halt: a deep groan whose pitch falls with the spin,
# plus rocky rumble noise, ends in a dull thud.
t = t_of(1.8)
f = 70 * np.exp(-t / 0.9) + 28
groan = sine(f, t) + 0.5 * sine(f * 2.01, t) + 0.25 * sine(f * 3.02, t)
rumble = svf(noise(1.8), 180 * np.exp(-t / 1.2) + 60, q=0.9, mode="lp")
shape = np.minimum(1, t / 0.04) * np.exp(-t / 0.75)
thud = svf(noise(1.8), 120, q=1.2, mode="lp") * env(t - 0.0, 0.01, 0.12)
write("grollen", (0.8 * groan + 1.4 * rumble) * shape + 1.2 * thud)

# A big wave breaking: rising roar, white-noise crash, hissing foam tail.
t = t_of(1.9)
roar = svf(noise(1.9), 300 + 900 * np.minimum(1, t / 0.45), q=0.6, mode="lp") * np.minimum(1, t / 0.45)
crash_env = np.where(t < 0.45, 0, np.exp(-(t - 0.45) / 0.35))
crash = svf(noise(1.9), 2500, q=0.5, mode="lp") * crash_env
foam = svf(noise(1.9), 5000, q=0.7, mode="hp") * np.where(t < 0.5, 0, np.exp(-(t - 0.5) / 0.6))
boom = sine(55 * np.exp(-np.maximum(0, t - 0.45) / 0.3) + 30, t) * crash_env
write("welle", 0.7 * roar + 1.6 * crash + 0.5 * foam + 0.9 * boom)
