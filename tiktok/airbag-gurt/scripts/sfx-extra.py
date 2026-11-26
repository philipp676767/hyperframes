# Own sounds of #99 Airbag gegen Gurt, synthesized with the make-sfx.py helpers.
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np

# airbag firing: a sharp pyro bang (broadband crack + low thump) and the
# gas rushing into the fabric bag (falling hiss), ~0.6 s
t = t_of(0.7)
crack = svf(noise(0.7), 2500, q=0.7, mode="hp") * env(t, 0.001, 0.035)
thump = svf(noise(0.7), 180, q=1.2, mode="lp") * env(t, 0.004, 0.16) * 3.0
fall = 900 * np.exp(-t * 5) + 300
hiss = svf(noise(0.7), 4200, q=0.6, mode="bp") * env(t, 0.01, 0.4) * 0.55
flap = svf(noise(0.7), 600, q=2.5, mode="bp") * env(t, 0.03, 0.22) * 0.8
write("airbagknall", crack * 1.6 + thump + hiss + flap)

# sled hitting the crash block: deep body thump, metal crunch with ringing
# partials, a few debris rattles, ~1.1 s
t = t_of(1.2)
body = svf(noise(1.2), 120, q=1.4, mode="lp") * env(t, 0.003, 0.35) * 4.0
crunch = svf(noise(1.2), 1600, q=0.9, mode="bp") * env(t, 0.002, 0.18) * 1.4
ring = sum(sine(f, t) * env(t, 0.002, d) * a for f, d, a in [(410, 0.5, 0.25), (733, 0.35, 0.18), (1187, 0.25, 0.12), (1730, 0.18, 0.08)])
rattle = np.zeros_like(t)
for c in rng.uniform(0.12, 0.7, 10):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    rattle[i : i + n] += rng.uniform(0.2, 0.6) * np.exp(-np.arange(n) / 120) * np.sign(rng.standard_normal(n))
write("crash", body + crunch + ring + svf(rattle, 3000, q=0.7, mode="hp") * 0.6)
