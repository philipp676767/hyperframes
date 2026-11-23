# YouTube #4 Pompeji — the video's own sounds (same file in every chapter's
# scripts/sfx-extra.py). Helpers from make-sfx.py: t_of noise sine svf env write rng np

# stadt: a busy Roman street — soft crowd murmur, distant footsteps, birds (loops, 10 s)
t = t_of(10)
mur = svf(noise(10), 520, q=0.9, mode="bp") * (0.7 + 0.3 * np.sin(2 * np.pi * t / 3.1) ** 2)
mur += 0.5 * svf(noise(10), 900, q=1.2, mode="bp") * (0.5 + 0.5 * np.sin(2 * np.pi * t / 1.7 + 1) ** 2)
steps = np.zeros_like(t)
for k in range(26):
    at = (k * 0.37 + rng.uniform(0, 0.1)) % 10
    tt = np.clip(t - at, 0, None)
    steps += (t >= at) * np.exp(-tt / 0.015) * np.sin(2 * np.pi * 140 * tt) * 0.4
birds = np.zeros_like(t)
for k in range(9):
    at = rng.uniform(0, 9.5)
    tt = np.clip(t - at, 0, None)
    f = 3200 + 900 * np.sin(2 * np.pi * 14 * tt)
    birds += (t >= at) * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.08) * 0.2
write("stadt", mur + steps + birds, peak_db=-12)

# wind: a mild afternoon breeze over open land (loops, 10 s)
t = t_of(10)
write("wind", svf(noise(10), 420, q=0.5, mode="lp") * (0.55 + 0.45 * np.sin(2 * np.pi * t / 6.5) ** 2), peak_db=-12)

# grollen: deep rumble of the ground / the mountain (4 s)
t = t_of(4)
rum = svf(noise(4), 70, q=0.8, mode="lp") * 3 + 0.4 * np.sin(2 * np.pi * 38 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t))
write("grollen", rum * env(t, 0.6, 2.6), peak_db=-6)

# ausbruch: the mountain bursting open — a blast, then a long roar (6 s)
t = t_of(6)
blast = svf(noise(6), 120, q=0.7, mode="lp") * np.exp(-t / 0.6) * 4
roar = svf(noise(6), 300, q=0.5, mode="lp") * (1 - np.exp(-t / 0.4)) * np.exp(-np.clip(t - 3.5, 0, None) / 1.5)
crack = svf(noise(6), 2500, q=0.8, mode="hp") * np.exp(-t / 0.05)
write("ausbruch", blast + roar * 1.6 + crack * 0.6, peak_db=-3)

# saeule: the column's constant roar far away (loops, 10 s)
t = t_of(10)
write("saeule", svf(noise(10), 180, q=0.6, mode="lp") * (0.8 + 0.2 * np.sin(2 * np.pi * t / 2.3)), peak_db=-12)

# steinregen: pumice pattering on roof tiles and paving (loops, 8 s)
t = t_of(8)
pat = np.zeros_like(t)
for c in rng.uniform(0, 8, 900):
    i = int(c * 44100)
    n = min(len(t) - i, 600)
    if n <= 0:
        continue
    f = rng.uniform(1500, 4200)
    pat[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / rng.uniform(40, 120)) * np.sin(2 * np.pi * f * np.arange(n) / 44100)
write("steinregen", pat + 0.3 * svf(noise(8), 1800, q=0.5, mode="bp"), peak_db=-10)

# einsturz: a roof giving way — creak, crack, tiles crashing down (3 s)
t = t_of(3)
creak = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 3 * t)) * t) * env(t, 0.2, 0.5) * (t < 0.8) * 0.5
crash = np.zeros_like(t)
for c in rng.uniform(0.75, 1.9, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 4000)
    crash[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / rng.uniform(150, 900)) * svf(noise(n / 44100), rng.uniform(800, 3000), q=1.0, mode="bp")[:n]
thud = svf(noise(3), 90, q=0.8, mode="lp") * np.exp(-np.clip(t - 0.75, 0, None) / 0.3) * (t > 0.75) * 3
write("einsturz", creak + crash + thud, peak_db=-4)

# glut: the pyroclastic flow — a deep, rushing, rolling roar (loops, 8 s)
t = t_of(8)
g = svf(noise(8), 140, q=0.6, mode="lp") * 2.4 + svf(noise(8), 600, q=0.5, mode="bp") * 0.8
write("glut", g * (0.85 + 0.15 * np.sin(2 * np.pi * t / 1.3)), peak_db=-6)

# meer: waves on a beach (loops, 10 s)
t = t_of(10)
sw = (np.sin(2 * np.pi * t / 5) * 0.5 + 0.5) ** 2
write("meer", svf(noise(10), 700, q=0.5, mode="lp") * (0.3 + sw), peak_db=-12)

# ruder: oars dipping in rhythm + creaking wood (loops, 8 s)
t = t_of(8)
r_ = np.zeros_like(t)
for k in range(19):
    at = k * 0.42
    tt = np.clip(t - at, 0, None)
    r_ += (t >= at) * svf(noise(8), 900, q=0.8, mode="bp") * np.exp(-tt / 0.12) * 0.8
cr = np.sin(2 * np.pi * (220 + 40 * np.sin(2 * np.pi * 1.2 * t)) * t) * 0.08
write("ruder", r_ + cr + 0.3 * svf(noise(8), 500, q=0.5, mode="lp"), peak_db=-10)

# ofen: a wood fire crackling in a brick oven (loops, 8 s)
t = t_of(8)
cr = np.zeros_like(t)
for c in rng.uniform(0, 8, 160):
    i = int(c * 44100)
    n = min(len(t) - i, 300)
    if n > 0:
        cr[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 25)
write("ofen", svf(cr, 2500, q=0.7, mode="hp") + 0.5 * svf(noise(8), 250, q=0.6, mode="lp"), peak_db=-12)

# zikaden: a hot summer day today — cicadas (loops, 8 s)
t = t_of(8)
cic = np.sin(2 * np.pi * 4300 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 42 * t))) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 2.7) ** 2)
write("zikaden", svf(cic, 4300, q=2, mode="bp") * 0.6 + 0.2 * svf(noise(8), 400, q=0.5, mode="lp"), peak_db=-14)

# graben: spades in hard ash (3 s, two strokes)
t = t_of(3)
gr = np.zeros_like(t)
for at in (0.2, 1.6):
    tt = np.clip(t - at, 0, None)
    gr += (t >= at) * svf(noise(3), 1600, q=0.8, mode="bp") * np.exp(-tt / 0.25) * (1 + 0.5 * np.sin(2 * np.pi * 30 * tt))
write("graben", gr, peak_db=-6)

# giessen: plaster pouring from a bucket (3 s)
t = t_of(3)
write("giessen", svf(noise(3), 900, q=0.6, mode="bp") * env(t, 0.3, 2.0) * (0.8 + 0.2 * np.sin(2 * np.pi * 7 * t)), peak_db=-8)

# beben: an earthquake — rumble + rattling tiles (3 s)
t = t_of(3)
rat = np.zeros_like(t)
for c in rng.uniform(0.2, 2.4, 120):
    i = int(c * 44100)
    n = min(len(t) - i, 500)
    rat[i : i + n] += rng.uniform(0.1, 0.6) * np.exp(-np.arange(n) / 60)
write("beben", svf(noise(3), 60, q=0.8, mode="lp") * 3 * env(t, 0.3, 2.2) + svf(rat, 2000, q=0.8, mode="hp"), peak_db=-5)
