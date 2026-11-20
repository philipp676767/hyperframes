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

# matsch: a heavy foot sinking into wet mud — a lowpass squelch whose
# resonance sweeps down, plus a small wet suck at the end
t = t_of(0.7)
sq = svf(noise(0.7), 900 * np.exp(-t * 5) + 120, q=5, mode="bp") * env(t, 0.02, 0.22)
suck = svf(noise(0.7), 1500, q=8, mode="bp") * env(np.maximum(0, t - 0.32), 0.01, 0.06) * (t > 0.32)
write("matsch", sq + 0.5 * suck)

# bohren: a ground drill turning in clay — low harmonic motor buzz with a
# slow wobble, grinding noise on top (loop-friendly, cut by `dur`)
t = t_of(5.0)
f0 = 72 + 4 * np.sin(2 * np.pi * 1.3 * t)
motor = sum(sine(f0 * k, t) / k for k in range(1, 7))
grind = svf(noise(5.0), 600 + 250 * np.sin(2 * np.pi * 2.1 * t), q=1.2, mode="bp")
write("bohren", (motor * 0.6 + grind * 0.45) * (0.85 + 0.15 * np.sin(2 * np.pi * 3.7 * t)))

# beben: an earthquake — a very deep rolling rumble with rattling debris
t = t_of(2.0)
deep = svf(noise(2.0), 55, q=1.2, mode="lp")
rattle = np.zeros_like(t)
for c in rng.uniform(0.1, 1.5, 40):
    i = int(c * 44100)
    n = min(len(t) - i, 300)
    rattle[i : i + n] += rng.uniform(0.2, 0.7) * np.exp(-np.arange(n) / 40)
rattle = svf(rattle, 2200, q=1.0, mode="bp")
write("beben", (deep * 2.2 + rattle * 0.6) * env(t, 0.15, 1.1))
