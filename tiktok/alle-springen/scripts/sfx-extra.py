# Own sounds of #71 "Alle springen gleichzeitig":
#   wumms — thousands of feet landing at once: deep thump + short rumble
#   jubel — a stadium crowd roaring (many voices = band-passed noise with slow swells)
t = t_of(1.4)
f = 70 * np.exp(-t * 3.0) + 32
phase = 2 * np.pi * np.cumsum(f) / 44100
body = np.sin(phase) * env(t, 0.004, 0.32)
rumble = svf(noise(1.4), 180, q=0.7, mode="lp") * env(t, 0.01, 0.55)
slap = svf(noise(1.4), 1800, q=0.6, mode="bp") * env(t, 0.002, 0.05)
write("wumms", 1.4 * body + 0.9 * rumble + 0.35 * slap)

t = t_of(3.0)
roar = svf(noise(3.0), 900, q=0.5, mode="bp") + 0.5 * svf(noise(3.0), 2600, q=0.9, mode="bp")
swell = 0.75 + 0.25 * np.sin(2 * np.pi * 0.9 * t + 1.3) * np.sin(2 * np.pi * 0.37 * t)
fadeio = np.minimum(1, t / 0.15) * np.minimum(1, (3.0 - t) / 0.9)
write("jubel", roar * swell * fadeio)
