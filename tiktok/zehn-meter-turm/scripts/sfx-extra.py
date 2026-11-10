# #65 10-Meter-Turm — own sounds, synthesized with the helpers of make-sfx.py.
SR = 44100

# klatsch: the belly flop — a hard broadband slap (skin on water), a low
# body thump, then the splash washing down for ~1 s
t = t_of(1.4)
slap = svf(noise(1.4), 2600, q=0.6, mode="bp") * np.exp(-t / 0.018)
crack = svf(noise(1.4), 6000, q=0.5, mode="hp") * np.exp(-t / 0.008)
thump = sine(85, t) * np.exp(-t / 0.09) + 0.6 * sine(140, t) * np.exp(-t / 0.05)
wash = svf(noise(1.4), 1800, q=0.5, mode="bp") * env(t, 0.06, 0.9) * 0.5
drops = np.zeros_like(t)
for c in rng.uniform(0.15, 1.1, 26):
    i = int(c * SR)
    n = min(len(t) - i, 900)
    k = np.arange(n) / SR
    drops[i : i + n] += rng.uniform(0.15, 0.5) * np.sin(2 * np.pi * rng.uniform(900, 2200) * k * (1 + 8 * k)) * np.exp(-k / 0.012)
write("klatsch", 2.2 * slap + 1.2 * crack + 1.4 * thump + wash + drops)

# rip: a clean hands-first entry — short tearing hiss, almost no splash
t = t_of(0.6)
rip = svf(noise(0.6), 3200, q=1.2, mode="bp") * env(t, 0.01, 0.12)
gulp = sine(260, t) * np.exp(-t / 0.06) * (1 - np.exp(-t / 0.01))
write("rip", rip + 0.4 * gulp)

# blubber: bubbles rising — many small resonant bloops with rising pitch
t = t_of(2.2)
b = np.zeros_like(t)
for c in rng.uniform(0.0, 2.0, 46):
    i = int(c * SR)
    n = min(len(t) - i, 2600)
    k = np.arange(n) / SR
    f0 = rng.uniform(320, 1100)
    b[i : i + n] += rng.uniform(0.3, 1.0) * np.sin(2 * np.pi * f0 * k * (1 + 6 * k)) * np.exp(-k / 0.025)
write("blubber", svf(b, 4000, q=0.6, mode="lp") * env(t, 0.05, 1.9))
