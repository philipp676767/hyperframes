# Own sounds of #50 "Katze schnurrt", synthesized with the helpers of
# make-sfx.py: t_of noise sine svf env write rng np.

# schnurren: ~26 rattles per second (the vocal folds slapping), each a
# short burst of breathy low noise; louder on the out-breath than the in-
# breath (purring runs on both, ~1.5 s per breath).
dur = 3.2
t = t_of(dur)
gate = np.abs(np.sin(np.pi * 26 * t)) ** 6
breath = 0.55 + 0.45 * (np.sin(2 * np.pi * t / 1.5 - 0.8) > 0)
breath = svf(breath.astype(float), 6, q=0.5, mode="lp")
body = svf(noise(dur), 260, q=0.9, mode="lp") + 0.5 * svf(noise(dur), 520, q=1.4, mode="bp")
hum = 0.35 * sine(52, t) + 0.25 * sine(78, t)
purr = (body * 1.0 + hum) * gate * breath
write("schnurren", purr * np.minimum(1, t / 0.15))

# saite: a heavy low guitar string plucked (Karplus-Strong, ~55 Hz) — the
# "Gewichte an einer Gitarrensaite" analogy, a deep slow wobble
dur = 2.6
n = int(44100 * dur)
period = int(44100 / 55)
buf = rng.uniform(-1, 1, period)
ks = np.zeros(n)
for i in range(n):
    j = i % period
    ks[i] = buf[j]
    buf[j] = 0.996 * 0.5 * (buf[j] + buf[(j + 1) % period])
write("saite", svf(ks, 1800, q=0.7, mode="lp") + 0.15 * ks)

# bruellen: a lion's roar — a low, rough, falling tone with breath noise,
# swelling in and dying away
dur = 1.8
t = t_of(dur)
f0 = 150 - 70 * np.clip(t / dur, 0, 1) + 6 * np.sin(2 * np.pi * 9 * t)
tone = sum(sine(f0 * k, t) / k for k in range(1, 9))
rough = tone * (1 + 0.6 * svf(noise(dur), 40, q=0.5, mode="lp"))
air = svf(noise(dur), 900, q=0.8, mode="bp")
roar = svf(rough + 0.8 * air, 1300, q=0.7, mode="lp")
e = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.6) / 0.45)
write("bruellen", roar * e)
