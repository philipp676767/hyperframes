# Own sounds of #45 "Mentos + Cola" (synthesized, helpers from make-sfx.py:
# t_of noise sine svf env write rng np). Used in assets/beats.js SFX.

# pfft — a PET bottle cap twisted open: a short hard gas burst that falls in
# pitch (bandpass sweeping down) plus a tiny plastic click at the start
t = t_of(0.45)
burst = svf(noise(0.45), 5200 * np.exp(-t * 5) + 900, q=1.1, mode="bp") * env(t, 0.004, 0.11)
click = np.zeros_like(t)
click[:120] = np.exp(-np.arange(120) / 14) * rng.choice([-1, 1], 120)
write("pfft", 1.0 * burst + 0.6 * svf(click, 3000, q=0.9, mode="hp"))

# prickeln — carbonation fizz: hundreds of tiny bright bubble ticks with a
# soft hiss underneath, swelling in and fading out
t = t_of(1.6)
fizz = np.zeros_like(t)
for c in rng.uniform(0.0, 1.5, 520):
    i = int(c * 44100)
    n = min(len(t) - i, 90)
    f = rng.uniform(3500, 9000)
    k = np.arange(n)
    fizz[i : i + n] += rng.uniform(0.2, 1.0) * np.sin(2 * np.pi * f * k / 44100) * np.exp(-k / 12)
hiss = svf(noise(1.6), 4200, q=0.8, mode="hp") * 0.18
shape = np.minimum(1, t / 0.15) * np.exp(-np.maximum(0, t - 0.5) / 0.55)
write("prickeln", (fizz + hiss) * shape)

# ruelps — a cartoonish burp: a low, rough glottal buzz (sawtooth with jitter
# around 85 → 70 Hz) through two vowel formants ("ö-a"), with a flutter
t = t_of(0.75)
f0 = 88 - 20 * t + 6 * np.sin(2 * np.pi * 7 * t) + rng.standard_normal(len(t)) * 2.5
phase = np.cumsum(f0) / 44100
saw = 2 * (phase % 1) - 1
flutter = 0.75 + 0.25 * np.sign(np.sin(2 * np.pi * 23 * t))
src = saw * flutter + 0.15 * noise(0.75)
f1 = 520 + 220 * np.minimum(1, t / 0.35)
f2 = 1250 - 250 * np.minimum(1, t / 0.4)
voice = svf(src, f1, q=5, mode="bp") + 0.6 * svf(src, f2, q=6, mode="bp") + 0.5 * svf(src, 160, q=1.2, mode="lp")
amp = np.minimum(1, t / 0.03) * np.where(t < 0.5, 1.0, np.exp(-(t - 0.5) / 0.07))
write("ruelps", voice * amp)
