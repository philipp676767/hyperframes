# Own sounds of #29 "Blitz ins Auto" (helpers from make-sfx.py:
# t_of noise sine svf env write rng np).

# donner: a close lightning strike — a sharp electric crack, then the deep
# rolling thunder that rumbles on for ~2.5 s
t = t_of(3.0)
crack = svf(noise(3.0), 4200, q=0.7, mode="hp") * env(t, 0.002, 0.05)
snap = svf(noise(3.0), 1400, q=1.2, mode="bp") * env(t, 0.004, 0.12)
roll_env = np.minimum(1, t / 0.06) * np.exp(-t / 1.1)
# the rumble flutters: several echoes off clouds and hills
flutter = 0.65 + 0.35 * np.sin(2 * np.pi * (3.1 * t + 0.8 * np.sin(2 * np.pi * 0.7 * t)))
rumble = svf(noise(3.0), 140 + 120 * np.exp(-t / 0.4), q=0.9, mode="lp") * roll_env * flutter
boom = sine(55 * np.exp(-t / 0.9) + 28, t) * env(t, 0.01, 0.5)
write("donner", 1.1 * crack + 0.8 * snap + 2.6 * rumble + 0.7 * boom)

# grollen: distant thunder far away, no crack — for the wide storm shots
t = t_of(3.5)
g_env = np.minimum(1, t / 0.5) * np.exp(-np.maximum(0, t - 0.5) / 1.2)
g_flut = 0.6 + 0.4 * np.sin(2 * np.pi * (2.3 * t + 0.6 * np.sin(2 * np.pi * 0.5 * t)))
write("grollen", svf(noise(3.5), 110, q=0.8, mode="lp") * g_env * g_flut, peak_db=-6)

# radioknacken: a car radio losing its signal — static bursts that crackle
# and a whine that drops away
t = t_of(1.4)
static = svf(noise(1.4), 2600, q=0.5, mode="bp")
gate = np.zeros_like(t)
for c in rng.uniform(0.0, 1.2, 14):
    i = int(c * 44100)
    n = min(len(t) - i, int(rng.uniform(0.02, 0.09) * 44100))
    gate[i : i + n] = rng.uniform(0.5, 1.0)
whine = sine(1800 * np.exp(-t / 0.5) + 300, t) * 0.18 * np.exp(-t / 0.6)
write("radioknacken", (static * (0.25 + gate) + whine) * np.exp(-np.maximum(0, t - 1.0) / 0.2))

# regen: steady rain on the car roof (loop bed)
t = t_of(4.0)
drops = np.zeros_like(t)
for c in rng.uniform(0.0, 4.0, 900):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    drops[i : i + n] += rng.uniform(0.2, 1.0) * np.exp(-np.arange(n) / 18)
hiss = svf(noise(4.0), 5000, q=0.4, mode="bp")
write("regen", svf(drops, 2200, q=0.6, mode="hp") * 0.8 + hiss * 0.5, peak_db=-6)

# funken: an electric arc sizzling over metal / jumping to the road
t = t_of(1.0)
buzz = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.3
arc = svf(noise(1.0), 3000 + 2000 * np.sin(2 * np.pi * 7 * t), q=2.0, mode="bp")
write("funken", (arc + buzz * svf(noise(1.0), 800, mode="lp")) * env(t, 0.005, 0.35))
