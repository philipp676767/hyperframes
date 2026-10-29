# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# platsch: the phone hits the bath water — a low thump as it breaks the
# surface, a bright splash hiss that falls in pitch, then a few bubble
# "bloops" (sines that sweep up quickly, like real bubbles popping free)
t = t_of(1.1)
thump = svf(noise(1.1), 180, q=0.9, mode="lp") * env(t, 0.004, 0.07)
splash = svf(noise(1.1), 5200 * np.exp(-t * 3.0) + 900, q=0.7, mode="bp") * env(t, 0.006, 0.22)
bub = np.zeros_like(t)
for c in [0.12, 0.19, 0.27, 0.33, 0.45, 0.58, 0.71]:
    tt = np.clip(t - c, 0, None)
    f0 = rng.uniform(350, 700)
    b = sine(f0 * (1 + 2.2 * tt / 0.05), t) * env(tt, 0.002, 0.03) * (t >= c)
    bub += rng.uniform(0.25, 0.5) * b
write("platsch", 2.2 * thump + 1.3 * splash + bub)

# reis: the phone lands in a bowl of rice — a soft thud and a dense rattle
# of hundreds of tiny grain clicks that thin out
t = t_of(0.9)
grains = np.zeros_like(t)
for c in np.sort(rng.exponential(0.12, 260)):
    i = int(min(c, 0.85) * 44100)
    n = min(len(t) - i, 90)
    grains[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 12)
thud = svf(noise(0.9), 240, q=0.8, mode="lp") * env(t, 0.004, 0.06)
write("reis", svf(grains, 4200, q=0.6, mode="hp") * 1.4 + 1.6 * thud)

# aus: the phone dies — a short electric buzz and a falling "power down" tone
t = t_of(0.75)
tone = sine(880 * np.exp(-t * 3.4) + 60, t) * env(t, 0.005, 0.28)
buzz = svf(noise(0.75), 1400, q=4, mode="bp") * env(t, 0.003, 0.05)
write("aus", tone + 0.8 * buzz)
