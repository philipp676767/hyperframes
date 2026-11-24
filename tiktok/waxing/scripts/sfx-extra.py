# Per-video sound effects for #95 Waxing (helpers from make-sfx.py:
#   t_of, noise, sine, svf, env, write, rng, np).

# "ratsch": a wax strip torn off the skin — a fast rising tear of dense
# crackles (fabric + hairs letting go) over a broad noise rip, ~0.32 s.
dur = 0.42
t = t_of(dur)
sr = 44100
crack = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.26, 70)):
    i = int(c * sr)
    n = min(len(t) - i, 120)
    crack[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 14) * rng.choice([-1, 1])
rip = svf(noise(dur), 2400, q=0.7, mode="bp")
shape = np.clip(t / 0.03, 0, 1) * np.exp(-np.clip(t - 0.2, 0, None) / 0.05)
write("ratsch", svf(crack, 1800, q=0.7, mode="hp") * 1.4 + rip * shape * 0.9)

# "blubb": thick wax bubbling in the heater — three low, slow bubble pops
# (a sine whose pitch rises as the bubble closes) with a soft simmer.
dur = 1.3
t = t_of(dur)
bub = svf(noise(dur), 500, q=0.6, mode="lp") * 0.08
for start, f0 in [(0.05, 170), (0.45, 210), (0.85, 150)]:
    tt = t - start
    m = (tt >= 0) & (tt < 0.12)
    f = f0 * (1 + 3.0 * np.clip(tt, 0, 0.12) / 0.12)
    ph = np.cumsum(np.where(m, f, 0)) / sr * 2 * np.pi
    bub += np.where(m, np.sin(ph) * np.exp(-np.clip(tt, 0, None) / 0.04), 0)
write("blubb", bub)
