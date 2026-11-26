# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# #97 Handy-Nacken: a neck crack ("knack") — 2-3 dry bony clicks, a hollow body
t = t_of(0.35)
x = np.zeros_like(t)
for c, a in [(0.0, 1.0), (0.045, 0.7), (0.08, 0.5)]:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n)
    x[i : i + n] += a * (rng.uniform(-1, 1, n) * np.exp(-k / 60) + 0.6 * np.sin(2 * np.pi * 1900 * k / 44100) * np.exp(-k / 120))
body = svf(noise(0.35), 420, q=2.5, mode="bp") * env(t, 0.002, 0.06)
write("knack", svf(x, 900, q=0.7, mode="hp") + 0.8 * body)

# the child lands on the shoulders: a soft heavy thud
t = t_of(0.6)
thud = svf(noise(0.6), 140, q=1.2, mode="lp") * env(t, 0.004, 0.22) + 0.6 * np.sin(2 * np.pi * (70 - 30 * t) * t) * env(t, 0.004, 0.3)
write("plumps", thud)
