# #63 Cola im Gefrierfach — the video's own sounds, synthesized with the
# helpers of make-sfx.py (t_of noise sine svf env write rng np).

# dosenknall: the can tears — a low thump (pressure release), a short bright
# metallic rip (thin aluminium tearing: dense clicks through a resonant band)
# and the hiss of the slush spraying out
t = t_of(1.3)
thump = svf(noise(1.3), 140, q=0.9, mode="lp") * env(t, 0.004, 0.16) * 2.2
rip = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.16, 70)):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    rip[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 18)
rip = svf(rip, 4200, q=2.5, mode="bp") * 1.6
ring = (sine(2650, t) * 0.5 + sine(4130, t) * 0.3) * env(t, 0.002, 0.25) * 0.35
spray = svf(noise(1.3), 2600, q=0.6, mode="hp") * env(t, 0.03, 0.9) * 0.55
write("dosenknall", thump + rip + ring + spray)

# psst: a can tab popping — tiny click, then a hiss that falls off
t = t_of(0.7)
click = np.zeros_like(t)
click[:60] = np.exp(-np.arange(60) / 8)
hiss = svf(noise(0.7), 5200, q=0.7, mode="bp") * env(t, 0.01, 0.45)
write("psst", svf(click, 2500, q=1.2, mode="bp") * 1.5 + hiss)

# knistern: ice crystals growing — sparse, bright, glassy micro-cracks
t = t_of(3.0)
cr = np.zeros_like(t)
for c in rng.uniform(0.0, 2.95, 140):
    i = int(c * 44100)
    n = min(len(t) - i, 90)
    cr[i : i + n] += rng.uniform(0.15, 1.0) * np.exp(-np.arange(n) / rng.uniform(6, 16))
glass = svf(cr, 6000, q=3.0, mode="bp") + svf(cr, 2800, q=2.0, mode="bp") * 0.6
write("knistern", glass)

# felsknack: a rock splitting — a hard crack, a low crunch, grit falling
t = t_of(1.2)
crack = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.06, 30)):
    i = int(c * 44100)
    n = min(len(t) - i, 300)
    crack[i : i + n] += rng.uniform(0.5, 1.0) * np.exp(-np.arange(n) / 40)
low = svf(noise(1.2), 180, q=1.0, mode="lp") * env(t, 0.005, 0.3) * 2.0
grit = svf(noise(1.2), 3000, q=0.7, mode="hp") * env(t, 0.08, 0.8) * 0.3
write("felsknack", svf(crack, 1800, q=0.9, mode="bp") * 1.4 + low + grit)
