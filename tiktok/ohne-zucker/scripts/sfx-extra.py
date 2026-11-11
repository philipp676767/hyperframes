# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# Plastic wrapper crinkle (frame 0): many tiny bright crackles, band-passed
t = t_of(0.9)
cr = np.zeros_like(t)
for c in rng.uniform(0.0, 0.75, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    cr[i : i + n] += rng.uniform(0.3, 1.0) * rng.choice([-1, 1]) * np.exp(-np.arange(n) / 18)
write("knister", svf(svf(cr, 2500, q=0.7, mode="hp"), 9000, q=0.7, mode="lp") * env(t, 0.01, 0.6))

# Sugar cubes landing on a wooden table: ~30 short dry clicks, getting denser
t = t_of(2.5)
cl = np.zeros_like(t)
times = np.cumsum(np.linspace(0.11, 0.045, 30))
times = times / times[-1] * 2.3
for c in times:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n) / 44100
    f = rng.uniform(1800, 2600)
    cl[i : i + n] += (np.sin(2 * np.pi * f * k) * 0.6 + rng.normal(0, 0.5, n)) * np.exp(-k / 0.012)
write("zuckerwuerfel", svf(cl, 1200, q=0.7, mode="hp"))
