# #81 Nicht blinzeln — the topic's own sounds, synthesized with the helpers of
# make-sfx.py: t_of noise sine svf env write rng np.

# a water drop: a short sine "plink" whose pitch rises fast (the bubble
# resonance of a drop hitting water) + a tiny noise splash
t = t_of(0.35)
f = 900 + 1700 * (1 - np.exp(-t * 28))
plink = np.sin(2 * np.pi * np.cumsum(f) / 44100) * np.exp(-t * 22)
splash = svf(noise(0.35), 4200, q=0.7, mode="bp") * env(t, 0.002, 0.04)
write("tropfen", plink + 0.35 * splash)

# skin being pulled taut: a soft rubbery squeak — a band-passed noise rub
# with a gliding resonance, plus a low creak
t = t_of(0.55)
rub = svf(noise(0.55), 1400, q=0.6, mode="bp")
glide = np.sin(2 * np.pi * np.cumsum(380 + 520 * t / 0.55) / 44100)
creak = glide * (0.5 + 0.5 * np.sin(2 * np.pi * 34 * t)) * env(t, 0.05, 0.4)
write("dehnen", 0.5 * rub * env(t, 0.04, 0.35) + 0.7 * creak)
