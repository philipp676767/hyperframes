# YouTube #5 Pyramiden — the video's own sounds (same file in every chapter's
# scripts/sfx-extra.py). Helpers from make-sfx.py: t_of noise sine svf env write rng np

# wind: dry desert wind with soft gusts (loops, 10 s)
t = t_of(10)
gust = 0.5 + 0.5 * np.sin(2 * np.pi * t / 7.3) ** 2
write("wind", svf(noise(10), 380, q=0.5, mode="lp") * gust + 0.25 * svf(noise(10), 1800, q=0.6, mode="bp") * gust ** 2, peak_db=-12)

# wasser: water lapping against a hull / the shore (loops, 10 s)
t = t_of(10)
lap = np.zeros_like(t)
for k in range(22):
    at = (k * 0.45 + rng.uniform(0, 0.2)) % 9.6
    tt = np.clip(t - at, 0, None)
    lap += (t >= at) * svf(noise(10), 700 + rng.uniform(-200, 300), q=1.4, mode="bp") * np.exp(-tt / 0.18) * 0.9
write("wasser", lap + 0.3 * svf(noise(10), 250, q=0.5, mode="lp"), peak_db=-12)

# hoehle: a quiet stone room — low air, a few drips, a hint of echo (loops, 10 s)
t = t_of(10)
air = svf(noise(10), 140, q=0.6, mode="lp") * 0.8
drip = np.zeros_like(t)
for at in (1.3, 4.1, 6.6, 8.9):
    tt = np.clip(t - at, 0, None)
    drip += (t >= at) * np.sin(2 * np.pi * (1500 - 600 * np.clip(tt * 20, 0, 1)) * tt) * np.exp(-tt / 0.05) * 0.3
    tt2 = np.clip(t - at - 0.11, 0, None)
    drip += (t >= at + 0.11) * np.sin(2 * np.pi * 900 * tt2) * np.exp(-tt2 / 0.08) * 0.1
write("hoehle", air + drip, peak_db=-14)

# segel: a sail flapping, ropes and wood creaking (loops, 10 s)
t = t_of(10)
flap = svf(noise(10), 300, q=0.7, mode="lp") * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * t / 2.3)) ** 6)
creak = np.zeros_like(t)
for at in (0.8, 3.7, 6.2, 8.8):
    tt = np.clip(t - at, 0, None)
    f = 180 + 60 * np.sin(2 * np.pi * 3 * tt)
    creak += (t >= at) * (t < at + 0.6) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.3) * 0.25
write("segel", flap + creak, peak_db=-13)

# baustelle: a distant building site — chisels tapping, a murmur of voices,
# a thud now and then (loops, 10 s)
t = t_of(10)
mur = svf(noise(10), 480, q=0.9, mode="bp") * (0.6 + 0.4 * np.sin(2 * np.pi * t / 2.9) ** 2) * 0.7
taps = np.zeros_like(t)
for k in range(48):
    at = rng.uniform(0, 9.8)
    tt = np.clip(t - at, 0, None)
    f = rng.uniform(2200, 3600)
    taps += (t >= at) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.012) * rng.uniform(0.15, 0.4)
thud = np.zeros_like(t)
for at in (2.2, 6.9):
    tt = np.clip(t - at, 0, None)
    thud += (t >= at) * svf(noise(10), 120, q=0.8, mode="lp") * np.exp(-tt / 0.12) * 2.5
write("baustelle", mur + taps + thud, peak_db=-12)

# meissel: copper chisel blows on limestone, close (loops, 4 s)
t = t_of(4)
hits = np.zeros_like(t)
for k in range(8):
    at = 0.12 + k * 0.48 + rng.uniform(-0.03, 0.03)
    tt = np.clip(t - at, 0, None)
    hits += (t >= at) * (np.sin(2 * np.pi * 2600 * tt) * 0.6 + svf(noise(4), 1800, q=1.0, mode="bp") * 1.4) * np.exp(-tt / 0.03)
write("meissel", hits, peak_db=-6)

# schlitten: a wooden sledge scraping over sand, men heaving (loops, 6 s)
t = t_of(6)
scrape = svf(noise(6), 900, q=0.6, mode="bp") * (0.6 + 0.4 * np.sin(2 * np.pi * t / 1.6) ** 2)
heave = np.zeros_like(t)
for at in (0.4, 2.0, 3.6, 5.2):
    tt = np.clip(t - at, 0, None)
    heave += (t >= at) * (t < at + 0.5) * svf(noise(6), 330, q=2.5, mode="bp") * np.exp(-tt / 0.22) * 1.2
write("schlitten", scrape + heave, peak_db=-10)

# giessen: water poured from a jar onto sand (2.5 s)
t = t_of(2.5)
write("giessen", svf(noise(2.5), 1600, q=0.7, mode="bp") * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)) * env(t, 0.15, 1.6), peak_db=-9)

# feuer: an oven / forge fire crackling (loops, 6 s)
t = t_of(6)
roar = svf(noise(6), 260, q=0.6, mode="lp") * 0.8
crack = np.zeros_like(t)
for k in range(40):
    at = rng.uniform(0, 5.9)
    i = int(at * 44100)
    n = min(len(t) - i, 260)
    crack[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 40)
write("feuer", roar + svf(crack, 2500, q=0.8, mode="hp"), peak_db=-11)

# nacht: a desert night — crickets, very soft wind (loops, 10 s)
t = t_of(10)
cr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > 0.6) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 1.3) ** 8) * 0.25
write("nacht", cr + 0.4 * svf(noise(10), 300, q=0.5, mode="lp"), peak_db=-15)

# stein: a heavy block set down — a deep thud with grit (1.5 s)
t = t_of(1.5)
write("stein", (svf(noise(1.5), 110, q=0.9, mode="lp") * 4 + 0.4 * svf(noise(1.5), 2000, q=0.8, mode="bp")) * env(t, 0.005, 0.25), peak_db=-5)

# hall: a big stone hall inside the pyramid — low air, distant boom (loops, 8 s)
t = t_of(8)
write("hall", svf(noise(8), 90, q=0.7, mode="lp") * 1.2 + 0.2 * np.sin(2 * np.pi * 55 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4)), peak_db=-14)
