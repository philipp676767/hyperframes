# Own sounds of #34 Handy-Akku (helpers from make-sfx.py):
# ladezap  — the charger bites: an electric zap with a fast rising whine
# quietsch — the % slams on the brakes: a squealing tyre-like screech
# funken   — sparks crackling at the port / the short circuit

# ladezap: bright noise burst + a sine whine sweeping up 300 → 2400 Hz
t = t_of(0.55)
whine = sine(300 + 2100 * (t / 0.55) ** 0.6, t) * env(t, 0.01, 0.25)
buzz = np.sign(sine(110, t)) * 0.25 * env(t, 0.005, 0.12)
zap = svf(noise(0.55), 5200, q=1.2, mode="bp") * env(t, 0.002, 0.05)
write("ladezap", 0.6 * whine + buzz + 1.4 * zap)

# quietsch: a high squeal that wobbles and falls, rubbed noise under it
t = t_of(0.75)
f = 2600 - 900 * (t / 0.75) + 120 * np.sin(2 * np.pi * 23 * t)
squeal = (sine(f, t) + 0.4 * sine(f * 2.01, t)) * env(t, 0.02, 0.35)
rub = svf(noise(0.75), f, q=6, mode="bp") * env(t, 0.02, 0.3)
write("quietsch", squeal + 0.8 * rub)

# funken: dozens of tiny clicks (bright, decaying) + a low electric thump
t = t_of(0.9)
crack = np.zeros_like(t)
for c in rng.uniform(0.0, 0.6, 40):
    i = int(c * 44100)
    n = min(len(t) - i, 160)
    crack[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 18) * np.exp(-c * 2.5)
thump = svf(noise(0.9), 180, q=0.9, mode="lp") * env(t, 0.004, 0.09)
write("funken", svf(crack, 2500, q=0.7, mode="hp") + 2.0 * thump)
