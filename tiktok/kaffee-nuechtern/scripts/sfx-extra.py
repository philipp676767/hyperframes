# Per-video sound effects for #83 Kaffee auf leeren Magen, synthesized with
# the helpers of make-sfx.py (t_of noise sine svf env write rng np).

# gluckern: coffee poured from a mug — a stream of liquid noise plus
# glugs (short resonant blips with a rising pitch, like air bubbles)
t = t_of(1.6)
stream = svf(noise(1.6), 900, q=0.7, mode="bp") * (0.35 + 0.15 * np.sin(t * 23))
stream *= np.clip(t / 0.05, 0, 1) * np.clip((1.6 - t) / 0.4, 0, 1)
glugs = np.zeros_like(t)
for c in np.arange(0.02, 1.3, 0.17) + rng.uniform(0, 0.05, 8):
    i = int(c * 44100)
    n = min(len(t) - i, 4000)
    tt = np.arange(n) / 44100
    f = rng.uniform(380, 520) * (1 + 2.2 * tt)
    glugs[i : i + n] += np.sin(2 * np.pi * np.cumsum(f) / 44100) * np.exp(-tt / 0.03)
write("gluckern", stream + 0.8 * glugs)

# blubbern: acid fizzing on meat — dense tiny bubble pops over a hiss
t = t_of(2.4)
fizz = svf(noise(2.4), 5200, q=0.6, mode="hp") * 0.25
pops = np.zeros_like(t)
for c in rng.uniform(0.0, 2.2, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    tt = np.arange(n) / 44100
    f = rng.uniform(900, 2600)
    pops[i : i + n] += rng.uniform(0.3, 1) * np.sin(2 * np.pi * f * tt * (1 + 6 * tt)) * np.exp(-tt / 0.004)
write("blubbern", (fizz + 0.6 * pops) * np.clip((2.4 - t) / 0.5, 0, 1) * np.clip(t / 0.08, 0, 1))

# knurren: a stomach growl — low, wobbling, gurgly rumble that rises and falls
t = t_of(1.5)
f0 = 70 + 30 * np.sin(2 * np.pi * 0.9 * t) + 18 * np.sin(2 * np.pi * 7.5 * t)
ph = 2 * np.pi * np.cumsum(f0) / 44100
tone = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3.1 * ph)
gurgle = svf(noise(1.5), 420, q=3.0, mode="bp") * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * t))
shape = np.sin(np.pi * np.clip(t / 1.5, 0, 1)) ** 0.7
write("knurren", (0.8 * tone + 0.9 * gurgle) * shape)
