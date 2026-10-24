# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of noise sine svf env write rng np.
# Each write("name", …) becomes assets/sfx-extra/name.wav (see beats.js SFX).

# The cabin chime ("Bitte anschnallen"): two soft bell tones, high then low,
# each a sine with a few inharmonic partials and a long decay.
def bell(freq, dur):
    t = t_of(dur)
    x = np.zeros_like(t)
    for mult, amp, dec in ((1.0, 1.0, 1.2), (2.0, 0.35, 0.6), (2.76, 0.18, 0.35), (4.07, 0.08, 0.2)):
        x += amp * np.sin(2 * np.pi * freq * mult * t) * np.exp(-t / dec)
    return x * np.minimum(1, t / 0.006)

t = t_of(1.6)
gong = np.zeros_like(t)
hi = bell(988, 1.6)
lo = bell(784, 1.6 - 0.42)
gong += hi
gong[int(0.42 * 44100):] += lo
write("gong", gong * np.exp(-t / 1.4))

# Frost creeping over the window: dense tiny ice cracks, getting busier,
# bright and glassy (high-passed clicks with a short ring).
t = t_of(1.3)
eis = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 1.15, 70)) ** 0.8:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n)
    f = rng.uniform(2500, 6500)
    eis[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-k / rng.uniform(40, 160)) * np.sin(2 * np.pi * f * k / 44100)
eis = svf(eis, 2000, q=0.7, mode="hp") + 0.3 * svf(noise(1.3), 7000, q=0.5, mode="hp") * env(t, 0.4, 0.5)
write("eis", eis * np.minimum(1, t / 0.05))
