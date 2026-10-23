# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. build-sfx.mjs runs this file.

# piezo: the lighter's click — a hard plastic/metal snap (hammer on crystal)
# followed by the electric crack of the spark jumping the gap
t = t_of(0.32)
snap = svf(noise(0.32), 2600, q=2.5, mode="bp") * env(t, 0.0005, 0.012)
body = sine(1850, t) * env(t, 0.0005, 0.02) * 0.5
crack = np.zeros_like(t)
for c in [0.006, 0.011, 0.019, 0.03, 0.045]:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    crack[i : i + n] += rng.uniform(0.5, 1.0) * rng.standard_normal(n) * np.exp(-np.arange(n) / 120)
crack = svf(crack, 5200, q=0.7, mode="hp")
write("piezo", 1.4 * snap + body + 0.9 * crack)

# zuend: the gas catching fire — soft low whump with a breathy tail
t = t_of(0.9)
whump = svf(noise(0.9), 240, q=0.9, mode="lp") * env(t, 0.02, 0.22)
air = svf(noise(0.9), 1400, q=0.6, mode="bp") * env(t, 0.04, 0.35) * 0.35
write("zuend", 1.6 * whump + air)

# ratsch: the flint wheel scraping — a quick gritty rasp with tiny sparks
t = t_of(0.4)
grit = np.zeros_like(t)
for c in rng.uniform(0.0, 0.25, 40):
    i = int(c * 44100)
    n = min(len(t) - i, 160)
    grit[i : i + n] += rng.uniform(0.3, 1.0) * rng.standard_normal(n) * np.exp(-np.arange(n) / 25)
rasp = svf(noise(0.4), 3200, q=1.2, mode="bp") * env(t, 0.01, 0.12) * 0.6
write("ratsch", svf(grit, 2500, q=0.7, mode="hp") + rasp)
