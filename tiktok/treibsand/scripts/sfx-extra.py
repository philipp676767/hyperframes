# #53 Treibsand — own sound: the wet slurp of quicksand (a suction "schmatz").
# Physics: a foot moving in water-logged sand = a low, muddy noise squelch
# (low-passed noise with a fast attack) + a few bubble pops (short sines
# whose pitch rises as the bubble closes) + a deep suction plop at the end.
t = t_of(0.75)
mud = svf(noise(0.75), 420, q=1.6, mode="lp") * env(t, 0.02, 0.22)
mud += 0.6 * svf(noise(0.75), 900, q=3.0, mode="bp") * env(t, 0.05, 0.12)
bubbles = np.zeros_like(t)
for start, f0 in zip(rng.uniform(0.05, 0.45, 5), rng.uniform(180, 380, 5)):
    tt = t - start
    on = (tt >= 0) & (tt < 0.09)
    ph = 2 * np.pi * np.cumsum(np.where(on, f0 * (1 + 6 * np.clip(tt, 0, 0.09)), 0)) / 44100
    bubbles += np.where(on, np.sin(ph) * np.exp(-np.clip(tt, 0, 1) / 0.03), 0)
tp = t - 0.42
plop_on = tp >= 0
fp = 140 * np.exp(-np.clip(tp, 0, 1) * 9)
plop = np.where(plop_on, np.sin(2 * np.pi * np.cumsum(np.where(plop_on, fp, 0)) / 44100) * np.exp(-np.clip(tp, 0, 1) / 0.08), 0)
write("schmatz", 1.4 * mud + 0.5 * bubbles + 0.9 * plop)
