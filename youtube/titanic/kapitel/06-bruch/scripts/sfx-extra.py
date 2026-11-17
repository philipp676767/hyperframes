# YouTube #2 Titanic — the video's own sounds (same file in every chapter).
# Helpers from make-sfx.py: t_of noise sine svf env write rng np

# glocke: the crow's-nest bell, struck three times (bronze partials, long ring)
t = t_of(2.6)
bell = np.zeros_like(t)
for k, at in enumerate([0.0, 0.55, 1.1]):
    tt = np.clip(t - at, 0, None)
    on = (t >= at).astype(float)
    for f, a, d in [(612, 1.0, 1.1), (1689, 0.55, 0.6), (3302, 0.3, 0.3), (1224, 0.35, 0.9)]:
        bell += on * a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d)
    bell += on * 0.4 * svf(noise(2.6), 4000, q=0.8, mode="hp") * np.exp(-tt / 0.01)
write("glocke", bell, peak_db=-4)

# morse: the spark transmitter — a buzzy, raspy tone keyed in C Q D (-.-. --.- -..)
u = 0.075
pattern = "-.-. --.- -.."
seq = []
for ch in pattern:
    if ch == " ":
        seq.append((0, 3 * u))
        continue
    seq.append((1, (3 if ch == "-" else 1) * u))
    seq.append((0, u))
dur = sum(d for _, d in seq) + 0.2
t = t_of(dur)
gate = np.zeros_like(t)
pos = 0.0
for on, d in seq:
    if on:
        gate[int(pos * 44100) : int((pos + d) * 44100)] = 1
    pos += d
gate = svf(gate, 300, q=0.5, mode="lp")
buzz = np.sign(np.sin(2 * np.pi * 480 * t)) * 0.5 + svf(noise(dur), 2500, q=1.2, mode="bp") * 0.8
write("morse", svf(buzz, 3500, q=0.7, mode="lp") * gate, peak_db=-8)

# meer: a calm night sea — slow, soft wash against the hull (loops)
t = t_of(12)
swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 6.0) ** 2
wash = svf(noise(12), 520, q=0.6, mode="lp") * swell + 0.25 * svf(noise(12), 2400, q=0.7, mode="bp") * swell**3
write("meer", wash, peak_db=-10)

# maschine: the deep thrum of the engines through the hull (loops)
t = t_of(10)
hum = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(38, 1.0, 0), (76, 0.5, 1), (114, 0.25, 2), (152, 0.12, 0.5)])
thump = 0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t) ** 8
write("maschine", (hum * thump + 0.2 * svf(noise(10), 180, q=0.7, mode="lp")) * 0.8, peak_db=-8)

# kratzen: ice grinding along the steel hull — low rumble + metallic scrape
t = t_of(4.5)
rumble = svf(noise(4.5), 140, q=0.9, mode="lp") * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t) ** 2)
scrape = svf(noise(4.5), 1800, q=4.0, mode="bp") * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * t + np.sin(t * 5)))
shape = np.minimum(1, t / 0.3) * np.clip((4.5 - t) / 1.2, 0, 1)
write("kratzen", (rumble * 1.4 + scrape * 0.5) * shape, peak_db=-4)

# bruch: the hull tearing — a deep crack, groaning steel, debris
t = t_of(4.0)
crack = svf(noise(4.0), 900, q=0.7, mode="lp") * np.exp(-t / 0.18)
groan = np.sin(2 * np.pi * (70 - 25 * t) * t) * np.exp(-t / 1.6) * 0.8
debris = np.zeros_like(t)
for c in rng.uniform(0.2, 3.0, 26):
    i = int(c * 44100)
    n = min(len(t) - i, 3000)
    debris[i : i + n] += rng.uniform(0.2, 0.7) * np.exp(-np.arange(n) / 500) * rng.standard_normal(n)
write("bruch", crack * 2.2 + groan + svf(debris, 1500, q=0.6, mode="lp"), peak_db=-3)

# rakete: a distress rocket — rising hiss, then the bang of the star shell
t = t_of(2.6)
hiss = svf(noise(2.6), 3000, q=0.8, mode="bp") * np.clip(t / 0.1, 0, 1) * (t < 1.4)
bang = svf(noise(2.6), 400, q=0.7, mode="lp") * np.exp(-np.clip(t - 1.4, 0, None) / 0.25) * (t >= 1.4)
write("rakete", hiss * 0.5 + bang * 2.0, peak_db=-5)

# wind: thin icy wind over the deck (loops)
t = t_of(10)
gust = 0.5 + 0.5 * np.sin(2 * np.pi * t / 5.0 + np.sin(t)) ** 2
write("wind", svf(noise(10), 700 + 300 * np.sin(t), q=2.0, mode="bp") * gust, peak_db=-12)

# tauchen: deep-sea ambience — sonar ping + low pressure hum (loops)
t = t_of(8)
ping = np.sin(2 * np.pi * 1450 * t) * np.exp(-np.mod(t, 4.0) / 0.5) * 0.4
hum = svf(noise(8), 90, q=0.8, mode="lp") * 1.5
write("tauchen", ping + hum, peak_db=-10)

# nieten: riveting hammers in the shipyard — fast metallic taps, two hammers
t = t_of(6)
taps = np.zeros_like(t)
for start, rate, amp in [(0.0, 9.5, 1.0), (0.13, 7.0, 0.6)]:
    for k in range(int(6 * rate)):
        at = max(0.0, start + k / rate + rng.uniform(-0.01, 0.01))
        if (k // 12) % 2 == 1:
            continue
        i = int(at * 44100)
        n = min(len(t) - i, 2500)
        if n <= 0:
            continue
        tt = np.arange(n) / 44100
        taps[i : i + n] += amp * (np.sin(2 * np.pi * 2300 * tt) + 0.5 * np.sin(2 * np.pi * 3900 * tt)) * np.exp(-tt / 0.012)
write("nieten", taps + 0.15 * svf(noise(6), 300, q=0.7, mode="lp"), peak_db=-6)
