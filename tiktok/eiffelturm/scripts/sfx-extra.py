# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of(dur), noise(dur), sine(freq, t),
# svf(x, cutoff, q, mode), env(t, a, d), write(name, x, peak_db=-3), rng, np
# Each write("name", …) becomes assets/sfx-extra/name.wav, used in beats.js SFX.

# knarzen: a huge stone tower groaning as it leans — a slow, rough low creak
# (stick-slip: a train of irregular low pulses through a resonant band that
# drifts down) over a deep rumble.
t = t_of(1.6)
pulses = np.zeros_like(t)
pos = 0.0
while pos < 1.45:
    i = int(pos * 44100)
    n = min(len(t) - i, 900)
    pulses[i : i + n] += rng.uniform(0.5, 1.0) * np.exp(-np.arange(n) / 160)
    pos += rng.uniform(0.012, 0.03) * (1 + pos)
band = svf(pulses, 420 - 180 * t / 1.6, q=6, mode="bp")
rumble = svf(noise(1.6), 70, q=0.9, mode="lp")
write("knarzen", (band * 1.2 + rumble * 0.5) * env(t, 0.12, 0.9))

# heat shimmer: a soft rising hiss with a faint metallic ping (iron warming up)
t2 = t_of(1.6)
hiss = svf(noise(1.6), 3200, q=0.7, mode="bp") * 0.5
ping = np.sin(2 * np.pi * 1870 * t2) * np.exp(-t2 * 6) * 0.35
write("hitze", (hiss * np.clip(t2 / 0.5, 0, 1) + ping) * env(t2, 0.3, 1.0))
