# YouTube #3 Tschernobyl — the video's own sounds (same file in every chapter).
# Helpers from make-sfx.py: t_of noise sine svf env write rng np

# halle: the hum of a big plant at night — transformers (50 Hz family) + air (loops)
t = t_of(10)
hum = sum(a * np.sin(2 * np.pi * f * t + p) for f, a, p in [(50, 0.6, 0), (100, 1.0, 1), (150, 0.35, 2), (200, 0.2, 0.5)])
write("halle", hum * 0.5 + 0.35 * svf(noise(10), 400, q=0.6, mode="lp"), peak_db=-12)

# nacht: a quiet spring night outside — soft wind + distant frogs / crickets (loops)
t = t_of(12)
wind = svf(noise(12), 300, q=0.5, mode="lp") * (0.6 + 0.4 * np.sin(2 * np.pi * t / 7) ** 2)
chirp = np.zeros_like(t)
for k in range(40):
    at = (k * 0.29) % 12
    tt = np.clip(t - at, 0, None)
    chirp += (t >= at) * np.sin(2 * np.pi * (3900 + 300 * np.sin(k)) * tt) * np.exp(-tt / 0.03) * 0.25
write("nacht", wind + chirp * 0.6, peak_db=-12)

# alarm: control-room alarm — a pulsing two-tone buzzer (4 s)
t = t_of(4)
gate = (np.sin(2 * np.pi * 2.2 * t) > 0).astype(float)
gate = svf(gate, 60, q=0.5, mode="lp")
tone = np.sign(np.sin(2 * np.pi * 620 * t)) * 0.4 + np.sign(np.sin(2 * np.pi * 930 * t)) * 0.3
write("alarm", svf(tone, 2600, q=0.7, mode="lp") * gate, peak_db=-8)

# knopf: a heavy push button clicking in (AZ-5)
t = t_of(0.4)
click = svf(noise(0.4), 2500, q=1.4, mode="bp") * np.exp(-t / 0.012) + 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.05)
write("knopf", click, peak_db=-4)

# rumpeln: deep shudder through the building before the blast (2.5 s, rising)
t = t_of(2.5)
rum = svf(noise(2.5), 90, q=0.9, mode="lp") * (t / 2.5) ** 1.5 + 0.4 * np.sin(2 * np.pi * (30 + 20 * t) * t) * (t / 2.5)
write("rumpeln", rum, peak_db=-4)

# explosion: two blasts a few seconds apart, a long tail of debris
t = t_of(7)
boom = np.zeros_like(t)
for at, a in [(0.0, 0.8), (2.2, 1.0)]:
    tt = np.clip(t - at, 0, None)
    on = (t >= at).astype(float)
    boom += on * a * (svf(noise(7), 120, q=0.7, mode="lp") * np.exp(-tt / 0.9) * 2.0 + np.sin(2 * np.pi * (45 - 20 * np.minimum(tt, 1)) * tt) * np.exp(-tt / 0.6))
    boom += on * a * svf(noise(7), 2500, q=0.6, mode="lp") * np.exp(-tt / 0.08) * 1.2
debris = svf(noise(7), 1800, q=0.8, mode="bp") * np.clip((t - 2.5) / 0.5, 0, 1) * np.exp(-np.clip(t - 2.5, 0, None) / 2.0) * 0.5
write("explosion", boom + debris, peak_db=-1)

# feuer: crackling fire (loops)
t = t_of(8)
roar = svf(noise(8), 220, q=0.6, mode="lp") * 0.8
crack = np.zeros_like(t)
r_ = (lambda g: (lambda: g.random()))(np.random.default_rng(5))
for k in range(260):
    at = r_() * 8
    tt = np.clip(t - at, 0, None)
    crack += (t >= at) * svf(noise(8), 2000 + 3000 * r_(), q=2, mode="bp") * np.exp(-tt / 0.006) * (0.4 + r_())
write("feuer", roar + crack * 0.6, peak_db=-8)

# sirene: a Soviet-era fire engine siren in the distance (6 s)
t = t_of(6)
f = 700 + 250 * np.sin(2 * np.pi * 0.5 * t)
ph = 2 * np.pi * np.cumsum(f) / 44100
write("sirene", svf(np.sign(np.sin(ph)) * 0.5, 1800, q=0.8, mode="lp") * np.minimum(1, t / 0.6), peak_db=-10)

# hubschrauber: rotor thump + turbine whine (loops)
t = t_of(8)
thump = (0.5 + 0.5 * np.sin(2 * np.pi * 4.6 * t)) ** 6
blades = svf(noise(8), 160, q=0.9, mode="lp") * thump * 2.2
whine = 0.12 * np.sin(2 * np.pi * 1850 * t) + svf(noise(8), 3000, q=2, mode="bp") * 0.2
write("hubschrauber", blades + whine, peak_db=-6)

# regen: steady rain on leaves (loops)
t = t_of(10)
rain = svf(noise(10), 5000, q=0.5, mode="lp") * 0.6 + svf(noise(10), 1200, q=0.7, mode="bp") * 0.4
drops = np.zeros_like(t)
r_ = (lambda g: (lambda: g.random()))(np.random.default_rng(9))
for k in range(400):
    at = r_() * 10
    tt = np.clip(t - at, 0, None)
    drops += (t >= at) * np.sin(2 * np.pi * (1500 + 2500 * r_()) * tt) * np.exp(-tt / 0.004) * 0.3
write("regen", rain + drops, peak_db=-10)

# waten: slow steps through knee-deep water (loops, ~1 step / 1.1 s)
t = t_of(6.6)
w = np.zeros_like(t)
for k in range(6):
    at = k * 1.1
    tt = np.clip(t - at, 0, None)
    w += (t >= at) * svf(noise(6.6), 700, q=0.8, mode="bp") * np.exp(-tt / 0.25) * (1 - np.exp(-tt / 0.03))
write("waten", w + 0.15 * svf(noise(6.6), 300, q=0.6, mode="lp"), peak_db=-8)

# tropfen: water dripping in a concrete basement (loops)
t = t_of(7)
d = np.zeros_like(t)
for at in [0.4, 1.9, 2.6, 4.1, 5.3, 6.4]:
    tt = np.clip(t - at, 0, None)
    d += (t >= at) * np.sin(2 * np.pi * (1100 - 400 * np.minimum(tt, 0.05) * 20) * tt) * np.exp(-tt / 0.05)
write("tropfen", d + 0.1 * svf(noise(7), 200, q=0.6, mode="lp"), peak_db=-10)

# ventil: a valve wheel turning, rusty squeak
t = t_of(2.0)
sq = svf(noise(2.0), 2200 + 600 * np.sin(2 * np.pi * 2.5 * t), q=6, mode="bp") * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * t) ** 2)
write("ventil", sq * np.minimum(1, t / 0.1) * np.clip((2 - t) / 0.3, 0, 1), peak_db=-8)

# bus: diesel buses idling and pulling away (loops)
t = t_of(8)
eng = sum(a * np.sign(np.sin(2 * np.pi * f * t + p)) for f, a, p in [(32, 0.5, 0), (64, 0.3, 1), (96, 0.15, 2)])
write("bus", svf(eng, 400, q=0.7, mode="lp") + 0.2 * svf(noise(8), 250, q=0.6, mode="lp"), peak_db=-10)

# morgen: birds on a spring morning (loops)
t = t_of(10)
b = np.zeros_like(t)
r_ = (lambda g: (lambda: g.random()))(np.random.default_rng(3))
for k in range(30):
    at = r_() * 9.5
    tt = np.clip(t - at, 0, None)
    f0 = 2800 + 1800 * r_()
    b += (t >= at) * (tt < 0.25) * np.sin(2 * np.pi * (f0 + 900 * np.sin(2 * np.pi * 18 * tt)) * tt) * np.exp(-tt / 0.08) * 0.4
write("morgen", b + 0.15 * svf(noise(10), 500, q=0.5, mode="lp"), peak_db=-12)

# wind: open wind over the zone (loops)
t = t_of(12)
write("wind", svf(noise(12), 450, q=0.6, mode="lp") * (0.5 + 0.5 * np.sin(2 * np.pi * t / 5) ** 2), peak_db=-10)

# rollen: a huge steel hall rolling on rails — deep rumble + creaks (loops)
t = t_of(8)
roll = svf(noise(8), 70, q=0.9, mode="lp") * 1.5
creak = svf(noise(8), 900, q=8, mode="bp") * (np.sin(2 * np.pi * 0.7 * t) > 0.9) * 0.6
write("rollen", roll + creak, peak_db=-8)
