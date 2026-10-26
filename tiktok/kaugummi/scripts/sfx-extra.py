# Own sounds of #37 Kaugummi (helpers from make-sfx.py: t_of noise sine svf env write rng np)

# schluck — a gulp: a short wet click (tongue) + a low pitch-falling "glk"
t = t_of(0.45)
click = svf(noise(0.45), 2400, q=2.0) * env(t, 0.001, 0.025)
glk_f = 320 * np.exp(-t / 0.09) + 110
glk = sine(glk_f, t) * env(t, 0.01, 0.12)
gurgle = svf(noise(0.45), 500 + 300 * np.sin(2 * np.pi * 18 * t), q=4.0) * env(t, 0.06, 0.12)
write("schluck", 0.6 * click + glk + 0.5 * np.roll(gurgle, int(0.05 * 44100)))

# platsch — the gum plops into the stomach fluid: a drop "plip" + a splash
t = t_of(0.7)
plip = sine(900 * np.exp(-t / 0.03) + 380, t) * env(t, 0.002, 0.06)
splash = svf(noise(0.7), 1800, q=0.7, mode="lp") * env(t, 0.01, 0.22)
write("platsch", plip + 0.7 * np.roll(splash, int(0.03 * 44100)))

# spuelung — a toilet flush: rushing water swelling, swirling, draining
t = t_of(2.4)
rush = svf(noise(2.4), 1400 + 500 * np.sin(2 * np.pi * 3.5 * t), q=0.8, mode="lp")
shape = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.9) / 0.6)
gurgle = svf(noise(2.4), 350 + 200 * np.sin(2 * np.pi * 9 * t), q=5.0) * np.clip((t - 1.0) / 0.4, 0, 1) * np.exp(-np.maximum(0, t - 1.6) / 0.35)
write("spuelung", rush * shape + 0.6 * gurgle)
