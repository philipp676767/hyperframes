# #72 Rolltreppe — the video's own sounds (helpers from make-sfx.py:
# t_of, noise, sine, svf, env, write, rng, np).

# schrubb: a sneaker scrubbing over stiff nylon bristles — four quick
# band-passed noise strokes, alternating a little in pitch
t = t_of(1.25)
x = np.zeros_like(t)
for k in range(5):
    a = 0.02 + k * 0.24
    stroke = np.clip((t - a) / 0.05, 0, 1) * np.exp(-np.clip(t - a - 0.05, 0, None) / 0.07) * (t >= a)
    x += stroke * (1.0 if k % 2 == 0 else 0.8)
n = noise(1.25)
write("schrubb", (svf(n, 2600, q=1.2, mode="bp") + 0.5 * svf(n, 5200, q=1.0, mode="bp")) * x)

# ratsch: a lace ripped into the gap — a fast falling zip + a dull thud
t = t_of(0.5)
zipp = svf(noise(0.5), 3800, q=2.5, mode="bp") * env(t, 0.005, 0.11)
grain = (np.sin(2 * np.pi * 70 * t * (1 + 3 * np.exp(-t / 0.05))) > 0.2).astype(float)
thud = sine(95, t) * env(t, 0.004, 0.16) * (t > 0.04)
write("ratsch", zipp * (0.5 + 0.5 * grain) + 1.3 * thud)
