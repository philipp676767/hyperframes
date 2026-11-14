# Per-video sound effects — the topic's own sounds (popcorn popping, a smoke
# alarm, a till drawer …), synthesized with the helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }. Names must differ from the
# house kit (whoosh, pop, ding …). build-sfx.mjs runs this file every time.
# A sound file the user hands over can be added with scripts/add-sfx.sh.

# #91 Flugmodus — own sounds
# GSM interference buzz: the famous "dit-dit-dit-dit" of a phone searching
# the network — a 217 Hz TDMA pulse train in bursts, through a small speaker.
def gsm(dur):
    t = t_of(dur)
    sq = (np.sin(2 * np.pi * 217 * t) > 0.6).astype(float)
    buzz = sq * (0.6 + 0.4 * np.sin(2 * np.pi * 1733 * t))
    gate = ((t % 0.46) < 0.30).astype(float)  # bursts
    x = svf(buzz * gate, 3200, q=0.9, mode="lp")
    x = svf(x, 300, q=0.7, mode="hp")
    return x * env(t, 0.01, 0.05)
write("gsm", gsm(1.4))
write("gsmlang", gsm(2.3))

# mosquito whine: thin high tone with a wobbling pitch and a doppler swell
t = t_of(1.2)
f = 620 + 60 * np.sin(2 * np.pi * 7 * t) + 90 * np.sin(2 * np.pi * 1.3 * t)
ph = 2 * np.pi * np.cumsum(f) / 44100
w = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)
amp = 0.35 + 0.65 * np.sin(np.pi * t / 1.2) ** 2
write("muecke", w * amp * env(t, 0.05, 0.15), peak_db=-6)

# jet pass: broad roar + a high turbine whine, swelling and fading
t = t_of(2.4)
roar = svf(noise(2.4), 900, q=0.6, mode="lp")
whine = np.sin(2 * np.pi * (2400 - 300 * t / 2.4) * t) * 0.08
sw = np.sin(np.pi * np.clip(t / 2.4, 0, 1)) ** 1.5
write("jet", (roar + whine) * sw)

# tyre touchdown: two short rubber chirps + a thump
t = t_of(0.9)
chirp = np.zeros_like(t)
for c, a in ((0.0, 1.0), (0.12, 0.7)):
    i = int(c * 44100)
    n = int(0.16 * 44100)
    k = np.arange(n) / 44100
    chirp[i : i + n] += a * np.sin(2 * np.pi * (1300 - 900 * k / 0.16) * k) * np.exp(-k * 18)
sq = svf(noise(0.9), 2500, q=1.2, mode="bp") * np.exp(-t * 10) * 0.6
thump = svf(noise(0.9), 120, q=0.9, mode="lp") * np.exp(-t * 9) * 2.5
write("reifen", chirp + sq + thump)
