# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# #39 Flugzeugklo: the vacuum flush — a hard "thunk" as the valve opens, a
# violent roaring suck (air rushing into the low-pressure pipe) that peaks
# fast and dies away, then the valve clunks shut.
DUR = 1.7
t = t_of(DUR)
n = noise(DUR)
# the roar: broadband noise, a band that sweeps down as the pipe empties
roar = np.zeros_like(t)
for lo, hi, g in ((300, 900, 1.0), (900, 2600, 0.7), (2600, 6000, 0.35)):
    roar += g * svf(n, (lo + hi) / 2, q=0.6, mode="bp")
shape = np.clip(t / 0.06, 0, 1) * np.exp(-np.maximum(t - 0.12, 0) / 0.45)
shape *= 1 + 0.25 * np.sin(2 * np.pi * 23 * t) * np.exp(-t / 0.5)  # gurgle flutter
roar = roar * shape
# deep body: the low "whomp" of the pipe
body = svf(noise(DUR), 120, q=1.2, mode="lp") * env(t, 0.01, 0.35) * 2.2
thunk = sine(70, t) * env(t, 0.002, 0.08) * 1.6
# valve closing at the end
close = np.zeros_like(t)
i = int(1.25 * 44100)
k = np.arange(len(t) - i)
close[i:] = (np.sin(2 * np.pi * 95 * k / 44100) * np.exp(-k / 2200)) * 0.9
close[i:] += svf(noise(DUR)[: len(k)], 1800, q=1.0, mode="bp") * np.exp(-k / 900) * 0.6
write("vakuum", roar + body + thunk + close)
