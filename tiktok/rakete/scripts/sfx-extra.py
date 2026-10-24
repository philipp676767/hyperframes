# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# Rocket engine roar (loop, give `dur`): a deep rumble (low-passed noise) +
# a crackling mid band that flutters (the "tearing" of a rocket plume), slow
# swells so a long cue never sounds static.
t = t_of(8.0)
rumble = svf(noise(8.0), 120, q=0.6, mode="lp") * 2.6
roar = svf(noise(8.0), 700, q=0.5, mode="bp") * 1.1
crack = np.zeros_like(t)
for c in rng.uniform(0, 7.95, 900):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    crack[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 18)
crack = svf(crack, 2400, q=0.7, mode="bp") * 0.9
swell = 0.8 + 0.2 * np.sin(2 * np.pi * 0.37 * t) * np.sin(2 * np.pi * 0.11 * t + 1)
x = (rumble + roar + crack) * swell
x[:2000] *= np.linspace(0, 1, 2000)
x[-2000:] *= np.linspace(1, 0, 2000)
write("triebwerk", x)

# Sonic boom: the falling booster's double bang ("ba-BOOM"), two N-wave
# thumps 0.18 s apart with a deep tail rolling over the sea.
t = t_of(2.2)
boom = np.zeros_like(t)
for at, amp in [(0.0, 0.8), (0.18, 1.0)]:
    tt = np.maximum(0, t - at)
    nw = np.where((t >= at) & (t < at + 0.03), 1 - 2 * (tt / 0.03), 0.0)
    boom += amp * nw
thump = svf(boom, 180, q=0.9, mode="lp") * 4
tail = svf(noise(2.2), 90, q=0.6, mode="lp") * env(t, 0.2, 0.7) * 2.2
write("knall", thump + tail + 0.3 * boom)

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
