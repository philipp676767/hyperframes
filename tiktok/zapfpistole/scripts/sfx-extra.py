# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of noise sine svf env write rng np.
# Each write("name", …) becomes assets/sfx-extra/name.wav (used in beats.js SFX).

# gluckern: fuel glugging into the tank (loop, build-sfx trims it to `dur`).
# Bubbles = short sines whose pitch rises as they shrink, plus a soft
# low-passed rush of the stream underneath.
D = 4.0
t = t_of(D)
x = np.zeros_like(t)
c = 0.0
while c < D - 0.12:
    f0 = rng.uniform(260, 620)
    dur = rng.uniform(0.035, 0.07)
    tt = t_of(dur)
    b = sine(f0 * (1 + 1.4 * tt / dur), tt) * env(tt, 0.004, dur * 0.45)
    i = int(c * 44100)
    x[i : i + len(b)] += rng.uniform(0.5, 1.0) * b
    c += rng.uniform(0.05, 0.14)
rush = svf(noise(D), 700, q=0.7, mode="lp") * (0.8 + 0.2 * np.sin(2 * np.pi * 2.3 * t))
write("gluckern", svf(x, 1800, q=0.7, mode="lp") + 0.35 * rush, peak_db=-6)
