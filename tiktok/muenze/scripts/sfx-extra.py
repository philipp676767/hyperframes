# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js.

# "kling": a coin flicked with the thumb — a bright metallic ring. A small
# copper disc rings at a few inharmonic partials (plate modes) with long,
# slightly beating decays, plus the click of the thumbnail.
t = t_of(1.4)
ring = np.zeros_like(t)
for f, a, d in [(2650, 1.0, 0.55), (4310, 0.6, 0.38), (6120, 0.35, 0.26), (8890, 0.18, 0.16)]:
    ring += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) * (1 + 0.25 * np.sin(2 * np.pi * 7 * t))
click = svf(noise(1.4), 6000, q=0.9, mode="hp") * np.exp(-t / 0.004)
write("kling", ring * env(t, 0.002, 1.3) + 1.6 * click)

# "tink": the coin bouncing off something hard — a short, high metallic hit
t = t_of(0.45)
hit = np.zeros_like(t)
for f, a, d in [(3400, 1.0, 0.09), (5200, 0.55, 0.06), (7600, 0.3, 0.04)]:
    hit += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
knock = svf(noise(0.45), 1800, q=0.8, mode="bp") * np.exp(-t / 0.01)
write("tink", hit + 0.8 * knock)
