# #84 Föhn — the topic's own sounds, synthesized with the make-sfx.py helpers.

# a hair dryer running: motor whine (fundamental + harmonics with a little
# wobble) over a band of rushing air; 8 s, trimmed by `dur` in beats.js
D = 8.0
t = t_of(D)
wob = 1 + 0.004 * np.sin(2 * np.pi * 5.3 * t)
whine = np.zeros_like(t)
for k, a in ((1, 1.0), (2, 0.5), (3, 0.35), (5, 0.18), (7, 0.08)):
    whine += a * sine(410 * k * wob, t)
air = svf(noise(D), 1500, q=0.6, mode="bp") * 2.2 + svf(noise(D), 5200, q=0.5, mode="bp") * 0.8
edge = np.minimum(1, t / 0.25) * np.minimum(1, (D - t) / 0.15)
write("foehn", (0.16 * whine + air) * edge)

# fire catching on cloth: dense crackle over a low whoosh, 2 s
D = 2.0
t = t_of(D)
cr = np.zeros_like(t)
for c in rng.uniform(0.0, 1.8, 46):
    i = int(c * 44100)
    n = min(len(t) - i, 260)
    cr[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 25)
roar = svf(noise(D), 380, q=0.7, mode="lp") * env(t, 0.25, 1.4)
write("knistern", svf(cr, 2600, q=0.8, mode="hp") + 1.2 * roar)
