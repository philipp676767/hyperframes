# Own sounds of #42 Tattoo (synthesized, see make-sfx.py helpers):
#   tattoo — the tattoo machine's buzz (coil-style ~110 Hz hum with a hard
#            mechanical tick on every stroke), loops via `dur` in beats.js
#   mampf  — a scavenger cell's gulp: a wet "glomp", pitch falling fast

# tattoo machine: 2.0 s seamless-ish buzz
t = t_of(2.0)
f0 = 110.0
saw = sum(np.sin(2 * np.pi * f0 * k * t) / k for k in range(1, 14))
ticks = np.zeros_like(t)
period = int(44100 / f0)
for i in range(0, len(t) - 120, period):
    ticks[i : i + 120] += np.exp(-np.arange(120) / 14)
buzz = svf(saw, 2400, q=1.2, mode="lp") * 0.6 + svf(ticks * noise(2.0), 4200, q=0.9, mode="bp") * 0.9
buzz *= 1 + 0.08 * np.sin(2 * np.pi * 7 * t)
write("tattoo", buzz, peak_db=-4)

# gulp: falling sine "blob" + a short wet click at the start
t = t_of(0.38)
freq = 340 * np.exp(-t * 9) + 80
phase = 2 * np.pi * np.cumsum(freq) / 44100
blob = np.sin(phase) * env(t, 0.008, 0.22)
click = svf(noise(0.38), 1800, q=2.0, mode="bp") * env(t, 0.001, 0.025)
write("mampf", blob + 0.6 * click)
