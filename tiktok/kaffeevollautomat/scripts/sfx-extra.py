# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py (t_of, noise, sine, svf, env, write, rng, np).
# Each write("name", …) becomes assets/sfx-extra/name.wav.

# Mahlwerk: a coffee grinder — motor whine + beans cracking between the burrs
dur = 2.6
t = t_of(dur)
f0 = 118 + 14 * np.minimum(1, t / 0.25)  # motor spins up
motor = sum(sine(f0 * k, t) / k for k in range(1, 7)) * 0.35
motor = svf(motor, 900, q=0.9, mode="lp")
grind = svf(noise(dur), 1800 + 500 * np.sin(2 * np.pi * 7 * t), q=1.3, mode="bp") * 0.55
crack = np.zeros_like(t)
for c in rng.uniform(0.05, dur - 0.1, 260):
    i = int(c * 44100)
    n = min(len(t) - i, 260)
    crack[i : i + n] += rng.uniform(0.3, 1.0) * rng.standard_normal(n) * np.exp(-np.arange(n) / 45)
crack = svf(crack, 3200, q=0.9, mode="bp") * 1.6
shape = np.minimum(1, t / 0.06) * np.minimum(1, (dur - t) / 0.3)
write("mahlwerk", (motor + grind + crack) * shape)

# Plaetschern: espresso running into the cup — little droplet blips over a soft trickle
dur = 2.4
t = t_of(dur)
x = svf(noise(dur), 900, q=0.7, mode="lp") * 0.25
for c in rng.uniform(0.0, dur - 0.08, 120):
    i = int(c * 44100)
    n = min(len(t) - i, 1800)
    tt = np.arange(n) / 44100
    f = rng.uniform(700, 1900) * (1 + 3.5 * tt)  # a droplet chirps upwards
    x[i : i + n] += rng.uniform(0.2, 0.6) * np.sin(2 * np.pi * np.cumsum(f) / 44100) * np.exp(-tt / 0.012)
shape = np.minimum(1, t / 0.08) * np.minimum(1, (dur - t) / 0.4)
write("plaetschern", x * shape)
