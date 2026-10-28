# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }.

# knirsch: a PET bottle crushed by the press — a dense burst of plastic
# crackles (many tiny clicks, bright), a hollow "bonk" of the bottle body
# collapsing, and a short low thud of the press plate
t = t_of(0.9)
crackle = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.55, 70)):
    i = int(c * 44100)
    n = min(len(t) - i, 260)
    w = np.exp(-c * 3.2)  # loudest at the start, then the plastic settles
    crackle[i : i + n] += rng.uniform(0.3, 1.0) * w * np.exp(-np.arange(n) / rng.uniform(12, 45))
crackle = svf(crackle * np.sign(rng.uniform(-1, 1, len(t))), 2600, q=0.9, mode="hp")
bonk = sine(420 * np.exp(-t * 3.5), t) * env(t, 0.004, 0.12) * 0.5
thud = svf(noise(0.9), 140, q=1.1, mode="lp") * env(t, 0.005, 0.22) * 2.2
write("knirsch", 1.4 * crackle + bonk + thud)

# drucker: an inkjet printer pulling the page through — a rhythmic
# head buzz (gated mid noise) over a soft motor whine, then the paper swish
t = t_of(1.1)
gate = (np.sin(2 * np.pi * 11 * t) > 0.1).astype(float)
head = svf(noise(1.1), 1800, q=2.5, mode="bp") * gate * env(t, 0.02, 0.9)
motor = sine(160 + 30 * np.sin(2 * np.pi * 3 * t), t) * 0.25 * env(t, 0.05, 0.9)
swish = svf(noise(1.1), 4000, q=0.7, mode="hp") * np.clip((t - 0.8) * 8, 0, 1) * np.exp(-np.clip(t - 0.85, 0, None) * 14)
write("drucker", head + motor + 0.6 * swish, peak_db=-6)
