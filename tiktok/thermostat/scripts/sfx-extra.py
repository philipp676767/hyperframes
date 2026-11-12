# #78 Thermostat — the topic's own sounds, synthesized with the make-sfx.py helpers.

# ratsche: the plastic detent clicks of a thermostat head being turned (7 clicks in 0.8 s)
t = t_of(0.9)
x = np.zeros_like(t)
for k, c in enumerate(np.linspace(0.02, 0.78, 7) + rng.uniform(-0.015, 0.015, 7)):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    tick = np.exp(-np.arange(n) / 70) * rng.uniform(0.7, 1.0)
    body = np.sin(2 * np.pi * (1900 + 120 * k) * np.arange(n) / 44100) * np.exp(-np.arange(n) / 160)
    x[i : i + n] += tick * rng.uniform(-1, 1, n) + 0.6 * body
write("ratsche", svf(x, 1400, q=0.7, mode="hp"))

# gluckern: hot water gurgling into a radiator — bubbly low resonances
t = t_of(2.4)
g = np.zeros_like(t)
for c in rng.uniform(0.0, 2.1, 26):
    i = int(c * 44100)
    n = min(len(t) - i, 6000)
    tt = np.arange(n) / 44100
    f0 = rng.uniform(220, 520)
    g[i : i + n] += np.sin(2 * np.pi * (f0 + 900 * tt) * tt) * np.exp(-tt / 0.03) * rng.uniform(0.4, 1)
flow = svf(noise(2.4), 600, q=0.6, mode="lp") * 0.35
write("gluckern", (g + flow) * env(t, 0.05, 1.6))
