# #94 Papier falten — the video's own sounds, synthesized with make-sfx.py's helpers.

# falten: a sheet flipped over (air swish + paper rustle) and the crease pressed flat
t = t_of(0.45)
rustle = svf(noise(0.45), 3200, q=0.6, mode="bp") * env(t, 0.02, 0.16)
crk = np.zeros_like(t)
for c in rng.uniform(0.02, 0.2, 14):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    crk[i : i + n] += rng.uniform(0.3, 0.9) * np.exp(-np.arange(n) / 18)
crease = svf(noise(0.45), 900, q=0.9, mode="lp") * env(t - 0.22, 0.005, 0.05) * (t > 0.22)
write("falten", 0.9 * rustle + 0.6 * svf(crk, 2500, q=0.7, mode="hp") + 1.4 * crease)

# knarz: a thick paper block straining against the fold (creak, then give up)
t = t_of(0.7)
f = 140 + 60 * np.sin(t * 9)
saw = np.sign(np.sin(2 * np.pi * np.cumsum(f) / 44100))
creak = svf(saw * (0.5 + 0.5 * rng.uniform(0, 1, len(t))), 1800, q=2.5, mode="bp") * env(t, 0.05, 0.4)
write("knarz", creak)

# krach: plaster / rock breaking (low thump + crumble)
t = t_of(1.4)
thump = sine(55, t) * np.exp(-t * 7) + svf(noise(1.4), 180, q=0.8, mode="lp") * np.exp(-t * 5)
crumble = np.zeros_like(t)
for c in rng.uniform(0.03, 1.0, 40):
    i = int(c * 44100)
    n = min(len(t) - i, 500)
    crumble[i : i + n] += rng.uniform(0.2, 0.8) * np.exp(-np.arange(n) / 90) * np.exp(-c * 2.2)
write("krach", 1.6 * thump + 0.7 * svf(crumble * noise(1.4), 2400, q=0.7, mode="bp"))
