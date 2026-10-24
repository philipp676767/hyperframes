# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.


# Seat rocket (loop, give `dur`): a hard, hissing roar — brighter and more
# "tearing" than a big launch engine (a small solid motor right under you).
t = t_of(6.0)
rumble = svf(noise(6.0), 160, q=0.6, mode="lp") * 2.0
roar = svf(noise(6.0), 1100, q=0.5, mode="bp") * 1.3
hiss = svf(noise(6.0), 4200, q=0.5, mode="hp") * 0.35
crack = np.zeros_like(t)
for c in rng.uniform(0, 5.95, 900):
    i = int(c * 44100)
    n = min(len(t) - i, 90)
    crack[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 14)
crack = svf(crack, 3000, q=0.7, mode="bp") * 0.8
swell = 0.85 + 0.15 * np.sin(2 * np.pi * 0.5 * t) * np.sin(2 * np.pi * 0.17 * t + 1)
x = (rumble + roar + hiss + crack) * swell
x[:600] *= np.linspace(0, 1, 600)
x[-3000:] *= np.linspace(1, 0, 3000)
write("rakete", x)

# Detonating cord + bursting canopy: a fast run of sharp cracks (the cord
# firing along the glass in ~0.15 s), a dry bang, then glass splinters
# tinkling away (bright, short metallic partials).
t = t_of(1.6)
run = np.zeros_like(t)
for k in range(14):
    i = int((0.005 + k * 0.011) * 44100)
    n = min(len(t) - i, 300)
    run[i : i + n] += np.exp(-np.arange(n) / 25) * rng.uniform(0.6, 1.0)
run = svf(run * noise(1.6), 3500, q=0.6, mode="bp") * 3
bang = svf(noise(1.6), np.linspace(3000, 300, len(t)), q=0.5, mode="lp") * env(t, 0.003, 0.25) * 1.6
low = sine(55 + 40 * np.exp(-t / 0.05), t) * env(t, 0.004, 0.3) * 0.9
glass = np.zeros_like(t)
for c in rng.uniform(0.12, 1.2, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 2500)
    f = rng.uniform(3500, 9000)
    tt = np.arange(n) / 44100
    glass[i : i + n] += rng.uniform(0.05, 0.3) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.03)
write("sprengschnur", run + bang + low + glass * 0.9)
# Explosion: a crack, then a deep roll of fire and debris rattling down.
t = t_of(2.8)
blast = svf(noise(2.8), np.linspace(2400, 200, len(t)), q=0.5, mode="lp") * env(t, 0.005, 0.5)
low = svf(noise(2.8), 70, q=0.8, mode="lp") * env(t, 0.02, 0.9) * 3.5
deb = np.zeros_like(t)
for c in rng.uniform(0.2, 2.2, 40):
    i = int(c * 44100)
    n = min(len(t) - i, 600)
    deb[i : i + n] += rng.uniform(0.1, 0.5) * np.exp(-np.arange(n) / 90) * np.sin(
        np.arange(n) * rng.uniform(0.15, 0.4)
    )
write("explosion", blast * 1.8 + low + svf(deb, 1800, q=0.8, mode="bp") * 0.6)
