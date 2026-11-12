# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# #79 Cola: a fingertip tapping an aluminium can — a short bright "tink"
# (a few metallic partials, fast decay) on a dull knock
t = t_of(0.28)
tink = sum(a * sine(f, t) for f, a in [(2150, 1.0), (3420, 0.6), (5230, 0.35), (1380, 0.4)]) * env(t, 0.001, 0.07)
knock = svf(noise(0.28), 500, q=1.2, mode="bp") * env(t, 0.001, 0.035)
write("klopf", 0.6 * tink + 1.4 * knock)

# shaking a full can: liquid sloshing back and forth, 5 strokes in 0.7 s
t = t_of(0.75)
slosh = np.zeros_like(t)
for k in range(5):
    s0 = k * 0.14
    e = np.clip((t - s0) / 0.03, 0, 1) * np.exp(-np.clip(t - s0, 0, None) / 0.07)
    slosh += e * (0.7 + 0.3 * (k % 2))
write("schuettel", svf(noise(0.75), 900, q=0.9, mode="bp") * slosh + 0.3 * svf(noise(0.75), 3500, q=0.7, mode="hp") * slosh)

# the fountain: a sharp hiss that turns into fizzing spray + splatter
t = t_of(1.8)
hiss = svf(noise(1.8), 5200, q=0.6, mode="hp") * env(t, 0.005, 1.4)
fizz = np.zeros_like(t)
for c in rng.uniform(0.05, 1.6, 140):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    fizz[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 18)
gush = svf(noise(1.8), 700, q=0.7, mode="lp") * env(t, 0.02, 0.9)
write("spritz", hiss + 0.8 * svf(fizz, 2500, q=0.7, mode="hp") + 0.9 * gush)
