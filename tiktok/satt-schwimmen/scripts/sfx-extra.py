# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# Cannonball into the lake: low body "whump" as the water parts, a bright
# rushing burst (spray), then droplets pattering back down for ~1 s.
t = t_of(1.8)
whump = svf(noise(1.8), 180, q=1.2, mode="lp") * env(t, 0.005, 0.22)
spray = svf(noise(1.8), 2600, q=0.6, mode="bp") * env(t, 0.02, 0.45)
drops = np.zeros_like(t)
for c in rng.uniform(0.25, 1.5, 60):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    f = rng.uniform(900, 2600)
    k = np.arange(n) / 44100
    drops[i : i + n] += rng.uniform(0.15, 0.5) * np.sin(2 * np.pi * (f + 3000 * k) * k) * np.exp(-k * 60)
write("platsch", 2.2 * whump + 1.2 * spray + 0.6 * drops)

# Lazy floating: soft water lapping, a few slow gentle splashes.
t = t_of(2.4)
lap = svf(noise(2.4), 700, q=0.7, mode="bp") * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t)) ** 2
write("plaetschern", lap * env(t, 0.3, 1.6), peak_db=-6)
