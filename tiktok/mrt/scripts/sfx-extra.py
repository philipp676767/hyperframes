# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }.

SR = 44100

# mrtklopf: the MRT's knocking. The gradient coils switch thousands of times
# a second; each switching burst makes the coil housing ring like a buzzy
# square-wave "tock" (here ~760 Hz with a low thump under it). A 2.4 s
# pattern that loops seamlessly: four quick knocks, a pause, a longer buzz.
dur = 2.4
t = t_of(dur)
x = np.zeros_like(t)


def burst(start, length, freq, amp):
    i0 = int(start * SR)
    n = int(length * SR)
    tt = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * freq * tt)) * 0.6 + np.sin(2 * np.pi * freq * 2.01 * tt) * 0.3
    e = np.minimum(1, tt / 0.003) * np.exp(-tt / (length * 0.55))
    thump = np.sin(2 * np.pi * 115 * tt) * np.exp(-tt / 0.03)
    seg = amp * (sq * e + 0.8 * thump)
    end = min(len(x), i0 + n)
    x[i0:end] += seg[: end - i0]


for k in range(4):
    burst(0.02 + k * 0.16, 0.075, 760, 1.0 if k == 0 else 0.8)
for k in range(4):
    burst(0.9 + k * 0.16, 0.075, 760, 1.0 if k == 0 else 0.8)
# a longer rattling buzz (fast repeated knocks)
for k in range(10):
    burst(1.6 + k * 0.065, 0.05, 1040, 0.7)
# the room rings a little
x = svf(x, 3800, q=0.7, mode="lp") + 0.15 * svf(x, 900, q=4, mode="bp")
write("mrtklopf", x)

# klonk: a steel oxygen bottle slamming into the magnet — a dull thud plus a
# few bright inharmonic metal partials that ring out
t = t_of(1.4)
metal = np.zeros_like(t)
for f, a, d in [(312, 1.0, 0.5), (851, 0.7, 0.35), (1427, 0.5, 0.25), (2213, 0.35, 0.18), (3170, 0.25, 0.12)]:
    metal += a * sine(f, t) * np.exp(-t / d)
thud = svf(noise(1.4), 180, q=0.9, mode="lp") * env(t, 0.002, 0.09) * 3.0
click = svf(noise(1.4), 4000, q=0.7, mode="hp") * env(t, 0.001, 0.015)
write("klonk", metal * np.minimum(1, t / 0.002) + thud + click)
