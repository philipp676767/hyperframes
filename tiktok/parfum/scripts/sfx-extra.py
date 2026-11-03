# Per-video sound effects of #54 "Parfum" (helpers from make-sfx.py:
# t_of noise sine svf env write rng np).

# The atomizer: a short pump click, then a hissing air-and-mist burst
# (bright band-passed noise, fast attack, ~0.4 s tail) with a soft
# "pff" body under it.
t = t_of(0.55)
click = np.zeros_like(t)
n = 180
click[:n] = np.exp(-np.arange(n) / 22) * np.sin(np.arange(n) * 2 * np.pi * 2400 / 44100)
hiss = svf(noise(0.55), 6500, q=0.7, mode="bp") * env(t - 0.015, 0.025, 0.34)
air = svf(noise(0.55), 1400, q=0.6, mode="bp") * env(t - 0.012, 0.02, 0.16)
write("spruehen", 0.5 * click + 1.4 * hiss + 0.6 * air)
