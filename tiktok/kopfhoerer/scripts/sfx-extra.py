# #60 Bluetooth-Kopfhörer — the video's own sounds (synthesized):
#   funk  — a burst of tiny digital chirps hopping in pitch (the radio hopping channels)
#   mikro — a running microwave: low mains hum + fan rush, a soft beep at the end

# funk: 22 short sine blips, each on a random "channel" pitch, fast decay
t = t_of(0.7)
x = np.zeros_like(t)
for k in range(22):
    c = 0.02 + k * 0.028 + rng.uniform(-0.006, 0.006)
    f = rng.uniform(1800, 4200)
    n = int(0.022 * 44100)
    i = int(c * 44100)
    if i + n >= len(t):
        break
    tt = np.arange(n) / 44100
    blip = np.sin(2 * np.pi * (f + 900 * tt / 0.022) * tt) * np.exp(-tt / 0.009)
    x[i : i + n] += blip * (1.0 - k / 30)
x = x * env(t, 0.005, 0.65) + 0.15 * svf(noise(0.7), 6000, q=0.7, mode="hp") * env(t, 0.005, 0.12)
write("funk", x)

# mikro: 2.2 s of hum (100 Hz + harmonics) and fan noise, then a beep
t = t_of(2.2)
hum = 0.5 * sine(100, t) + 0.25 * sine(200, t) + 0.12 * sine(300, t)
hum *= 0.8 + 0.2 * sine(3.1, t)
fan = svf(noise(2.2), 900, q=0.6, mode="lp") * 0.6
body = (hum + fan) * env(t, 0.08, 2.1)
write("mikro", body)
