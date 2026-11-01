# #46 Blondieren — the video's own sound: aluminium foil crinkling (a salon
# full of foils). Many short bright clicks of random loudness, clustered,
# band-passed high, plus a thin papery hiss.
t = t_of(0.6)
crk = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.5, 46)):
    i = int(c * 44100)
    n = min(len(t) - i, 160)
    crk[i : i + n] += rng.uniform(0.2, 1.0) * rng.choice([-1, 1]) * np.exp(-np.arange(n) / rng.uniform(8, 25))
hiss = svf(noise(0.6), 6000, q=0.7, mode="hp") * env(t, 0.02, 0.35) * 0.25
write("folie", svf(crk, 2800, q=0.7, mode="hp") + hiss)
