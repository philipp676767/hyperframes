# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js.

# plumps: a head landing on a soft pillow — a muffled low thump + a breath of
# fabric noise (low-passed), very short attack.
t = t_of(0.55)
thump = sine(95.0 * np.exp(-t * 5.0), t) * env(t, 0.004, 0.12)
fabric = svf(noise(0.55), 900, q=0.7, mode="lp") * env(t, 0.01, 0.16)
write("plumps", 1.4 * thump + 0.9 * fabric)

# knirsch: dried mascara crumbling — a dense run of tiny crispy clicks
# (high-passed impulses), getting thinner towards the end.
t = t_of(1.3)
x = np.zeros_like(t)
for c in rng.uniform(0.0, 1.15, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    x[i : i + n] += rng.uniform(0.3, 1.0) * (1.2 - c) * np.exp(-np.arange(n) / 14)
write("knirsch", svf(x, 2600, q=0.9, mode="hp"))
