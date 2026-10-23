# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# Example (delete or replace): a candle wick catching fire — short crackle + soft whump
t = t_of(0.7)
crackle = np.zeros_like(t)
for c in rng.uniform(0.0, 0.45, 9):
    i = int(c * 44100)
    n = min(len(t) - i, 200)
    crackle[i : i + n] += rng.uniform(0.4, 1.0) * np.exp(-np.arange(n) / 30)
whump = svf(noise(0.7), 260, q=0.8, mode="lp") * env(t, 0.03, 0.18)
write("anzuenden", svf(crackle, 3500, q=0.8, mode="hp") + 1.5 * whump)
