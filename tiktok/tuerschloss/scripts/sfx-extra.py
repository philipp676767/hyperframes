# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# #88 Türschloss: a key sliding into a pin-tumbler lock — metal scrape with
# the pins clicking over each tooth — and a bunch of keys jingling.
def tick(x, at, amp, freqs):
    i = int(at * SR)
    n = min(len(x) - i, 2600)
    tt = np.arange(n) / SR
    for f in freqs:
        x[i : i + n] += amp * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70)


t = t_of(1.8)
scrape = svf(noise(1.8), 4200, q=1.4, mode="bp") * 0.22 * env(t, 0.05, 1.5) * (t < 1.7)
clicks = np.zeros_like(t)
for k, at in enumerate([0.12, 0.3, 0.46, 0.62, 0.8, 0.95, 1.1, 1.25, 1.4]):
    tick(clicks, at + rng.uniform(-0.02, 0.02), rng.uniform(0.5, 0.9), [3100 + 180 * k, 5200, 7400])
seat = np.zeros_like(t)
tick(seat, 1.62, 1.2, [1700, 2900, 4300])
write("schluessel", scrape + clicks + seat)

t = t_of(1.4)
jing = np.zeros_like(t)
for at in rng.uniform(0.0, 0.8, 16):
    tick(jing, at, rng.uniform(0.3, 0.8), list(rng.uniform(2400, 9000, 3)))
write("klimpern", jing * env(t, 0.01, 1.3))
