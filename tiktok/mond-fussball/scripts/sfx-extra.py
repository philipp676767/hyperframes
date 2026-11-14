# #85 Fußball auf dem Mond — the video's own sounds, synthesized with the
# helpers of make-sfx.py (t_of noise sine svf env write rng np).

# kick: a boot hitting a pumped leather ball — a short bright slap on top of
# a deep thump whose pitch drops fast
t = t_of(0.45)
f = 140 * np.exp(-t * 18) + 55
thump = np.sin(2 * np.pi * np.cumsum(f) / 44100) * env(t, 0.002, 0.16)
slap = svf(noise(0.45), 2400, q=0.9, mode="bp") * env(t, 0.001, 0.035)
write("kick", 1.0 * thump + 0.8 * slap)

# tick: a stopwatch, four dry clicks per second (looped by build-sfx)
t = t_of(1.0)
x = np.zeros_like(t)
for k in range(4):
    i = int(k * 0.25 * 44100)
    n = 600
    x[i : i + n] += svf(noise(0.05), 5200, q=2.5, mode="bp")[:n] * np.exp(-np.arange(n) / 70)
write("tick", x)

# shutter: a phone camera — two quick mechanical clicks
t = t_of(0.3)
x = np.zeros_like(t)
for c, a in ((0.0, 1.0), (0.085, 0.7)):
    i = int(c * 44100)
    n = 900
    x[i : i + n] += a * svf(noise(0.05), 3800, q=1.6, mode="bp")[:n] * np.exp(-np.arange(n) / 120)
write("shutter", x)
