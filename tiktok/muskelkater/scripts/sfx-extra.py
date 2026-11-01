# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }.

# #47 Muskelkater: alpine cowbells — two bells of different pitch, struck a few
# times at uneven intervals as the cows move their heads. A bell = a short
# metallic clank (noise burst) + inharmonic partials with fast-to-slow decay.
DUR = 2.2
t = t_of(DUR)
mix = np.zeros_like(t)
SR = 44100
def bell(f0, at, amp):
    global mix
    i = int(at * SR)
    tt = t[: len(t) - i]
    ratios = [1.0, 1.52, 2.07, 2.76, 3.61, 4.43]
    decays = [0.55, 0.38, 0.28, 0.2, 0.14, 0.1]
    gains = [1.0, 0.7, 0.55, 0.4, 0.28, 0.2]
    x = np.zeros_like(tt)
    for r, d, g in zip(ratios, decays, gains):
        x += g * np.sin(2 * np.pi * f0 * r * tt + rng.uniform(0, 6.28)) * np.exp(-tt / d)
    clank = svf(rng.standard_normal(len(tt)), 3200, q=1.2, mode="bp") * np.exp(-tt / 0.012)
    mix[i:] += amp * (x * np.minimum(1, tt / 0.002) + 0.6 * clank)
for at, f, a in [(0.0, 610, 1.0), (0.21, 845, 0.65), (0.55, 610, 0.7), (0.9, 845, 0.45), (1.35, 610, 0.4)]:
    bell(f, at, a)
write("kuhglocke", svf(mix, 7000, q=0.7, mode="lp"))
