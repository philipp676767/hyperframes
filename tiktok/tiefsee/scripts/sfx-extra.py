# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.

# platsch: the sub hits the water — a low body thump + a bright spray hiss
t = t_of(1.2)
thump = svf(noise(1.2), 180, q=0.9, mode="lp") * env(t, 0.005, 0.22)
body = sine(70, t) * np.exp(-t * 9) * 0.8
spray = svf(noise(1.2), 2800, q=0.6, mode="bp") * env(t, 0.02, 0.6)
drops = np.zeros_like(t)
for c in rng.uniform(0.15, 0.9, 14):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    k = np.arange(n) / 44100
    drops[i : i + n] += rng.uniform(0.2, 0.5) * np.sin(2 * np.pi * (900 + 1800 * k) * k) * np.exp(-k * 60)
write("platsch", 1.6 * thump + body + 0.9 * spray + 0.5 * drops)

# knack: thin aluminium buckling under pressure — a sharp crack, then crumple
t = t_of(0.8)
crack = svf(noise(0.8), 3200, q=1.2, mode="bp") * env(t, 0.001, 0.05)
crumple = np.zeros_like(t)
for c in np.sort(rng.uniform(0.02, 0.45, 18)):
    i = int(c * 44100)
    n = min(len(t) - i, 500)
    crumple[i : i + n] += rng.uniform(0.3, 0.9) * np.exp(-np.arange(n) / 70)
ring = sum(sine(f, t) * np.exp(-t * d) for f, d in [(1240, 18), (2310, 24), (3470, 30)]) * 0.25
write("knack", 2.0 * crack + svf(crumple, 1800, q=0.7, mode="hp") + ring)

# sonar: the classic submarine ping — a pure tone with a long watery echo
t = t_of(2.2)
ping = sine(1450, t) * env(t, 0.004, 0.35)
echo = sine(1450, t - 0.55) * env(np.clip(t - 0.55, 0, None), 0.004, 0.5) * 0.35 * (t > 0.55)
write("sonar", svf(ping + echo, 1450, q=3, mode="bp") * 0.6 + 0.4 * (ping + echo))
