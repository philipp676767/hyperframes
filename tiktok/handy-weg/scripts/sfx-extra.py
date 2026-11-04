# Per-video sound effects for #57 "Woche ohne Handy" (helpers from make-sfx.py:
# t_of noise sine svf env write rng np).

# vibe: a phone on vibrate — two short buzzes of a small motor (~165 Hz with
# harmonics, a rough amplitude flutter), a little rattle on a hard surface
t = t_of(0.95)
gate = ((t > 0.0) & (t < 0.36)) | ((t > 0.5) & (t < 0.86))
edge = np.minimum(1, np.minimum(t * 60, 1)) * gate
motor = sum(a * np.sign(sine(165 * k, t)) for k, a in [(1, 1.0), (2, 0.45), (3, 0.25)])
flutter = 0.75 + 0.25 * np.sin(2 * np.pi * 31 * t)
rattle = svf(noise(0.95), 2400, q=1.2, mode="bp") * 0.5
x = svf(motor * flutter + rattle, 1800, q=0.7, mode="lp") * edge
write("vibe", x)
