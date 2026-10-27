# Per-video sound effects — the topic's own sounds, synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# #38 Knicklicht: the glow stick snapping — a dull plastic creak (the tube
# bends), then the bright glass "tick-crack" of the inner vial and a few
# tiny glass tinkles after it.
t = t_of(0.55)
creak = svf(noise(0.55), 700, q=6, mode="bp") * env(t, 0.06, 0.08) * 0.5
crack = np.zeros_like(t)
i0 = int(0.075 * 44100)
for k, c in enumerate([0.0, 0.004, 0.011, 0.019]):
    i = i0 + int(c * 44100)
    n = min(len(t) - i, 900)
    crack[i : i + n] += (1.0 - 0.18 * k) * np.exp(-np.arange(n) / 110)
crack = svf(crack * noise(0.55), 2600, q=0.7, mode="hp")
tink = np.zeros_like(t)
for c in rng.uniform(0.12, 0.42, 6):
    i = int(c * 44100)
    n = min(len(t) - i, 2600)
    f = rng.uniform(4200, 7800)
    tink[i : i + n] += rng.uniform(0.12, 0.3) * np.sin(2 * np.pi * f * np.arange(n) / 44100) * np.exp(-np.arange(n) / 500)
write("knack", creak + 1.6 * crack + tink)
