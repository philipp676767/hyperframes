# #66 Glätteisen — the topic's own sounds, synthesized with the helpers of
# make-sfx.py (t_of, noise, sine, svf, env, write, rng, np).

# brutzeln: wet hair on 200 °C plates — a hiss with dense tiny crackles
# (water flashing to steam), fading over ~1.3 s
t = t_of(1.4)
hiss = svf(noise(1.4), 5200, q=0.7, mode="hp") * env(t, 0.02, 0.55) * 0.55
crackle = np.zeros_like(t)
for c in rng.uniform(0.0, 1.0, 70) ** 1.6:
    i = int(c * 44100)
    n = min(len(t) - i, 160)
    crackle[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 18) * (1 - c * 0.7)
write("brutzeln", hiss + svf(crackle, 2600, q=0.8, mode="hp") * 1.4)

# blubbern: water boiling inside — a handful of bubbles, each a short sine
# chirp rising in pitch (bubble resonance)
t = t_of(1.2)
x = np.zeros_like(t)
for c in rng.uniform(0.0, 1.0, 14):
    i = int(c * 44100)
    n = min(len(t) - i, int(0.07 * 44100))
    tt = np.arange(n) / 44100
    f0 = rng.uniform(380, 900)
    x[i : i + n] += np.sin(2 * np.pi * np.cumsum(f0 * (1 + tt * 9)) / 44100) * np.exp(-tt / 0.02)
write("blubbern", x * env(t, 0.05, 0.6))

# knacken: bonds cracking — two dry snaps with a brittle high tail
t = t_of(0.5)
x = np.zeros_like(t)
for c, a in [(0.0, 1.0), (0.07, 0.7), (0.16, 0.45)]:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    x[i : i + n] += a * rng.standard_normal(n) * np.exp(-np.arange(n) / 90)
write("knacken", svf(x, 3000, q=0.9, mode="hp") + svf(x, 900, q=2, mode="bp") * 0.6)
