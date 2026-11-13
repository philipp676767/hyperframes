# #90 Protein-Shake — the video's own sounds, synthesized like the house kit:
#   shaker  — the whisk ball rattling in a shaker (frame 0 and the CTA)
#   muenzen — coins tumbling out and clinking on each other
#   spuelung — a toilet flush (the leftover protein goes down the Klo)

# shaker: 8 strokes per second, each a liquid slosh + a metallic ball hit
dur = 1.5
t = t_of(dur)
x = np.zeros_like(t)
for k in range(int(dur * 8)):
    i = int((k / 8 + rng.uniform(-0.006, 0.006)) * 44100)
    n = min(len(t) - i, 5000)
    if n <= 0:
        continue
    tt = np.arange(n) / 44100
    slosh = svf(rng.standard_normal(n), 900, q=0.6, mode="lp") * np.exp(-tt / 0.05) * 0.8
    ping = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for a, f, d in [(0.5, 2350, 0.03), (0.3, 3900, 0.018), (0.2, 5600, 0.01)])
    rattle = svf(rng.standard_normal(n), 4200, q=1.2) * np.exp(-tt / 0.012) * 0.6
    x[i : i + n] += (slosh + ping * rng.uniform(0.6, 1.0) + rattle) * (0.85 + 0.15 * (k % 2))
write("shaker", x)

# coins: ~12 bright clinks, each two inharmonic metallic partials, fast decay
dur = 1.3
t = t_of(dur)
x = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.9, 12)):
    i = int(c * 44100)
    n = min(len(t) - i, 9000)
    tt = np.arange(n) / 44100
    f0 = rng.uniform(2600, 4200)
    tone = sum(a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt / d) for a, r, d in [(1, 1, 0.12), (0.6, 1.47, 0.08), (0.35, 2.31, 0.05)])
    tick = svf(rng.standard_normal(n), 6000, q=0.9) * np.exp(-tt / 0.004)
    x[i : i + n] += (tone * 0.5 + tick * 0.6) * rng.uniform(0.5, 1.0)
write("muenzen", x)

# flush: a lever clack, then a rushing, swirling, slowly falling water noise
dur = 2.2
t = t_of(dur)
clack = svf(noise(dur), 1800, q=1.0) * env(t, 0.001, 0.03)
rush_env = np.clip(t / 0.18, 0, 1) * np.exp(-np.maximum(t - 0.4, 0) / 0.9)
swirl = 700 + 500 * np.sin(2 * np.pi * 3.2 * t) * np.exp(-t / 1.2)
rush = svf(noise(dur), 1100, q=0.5, mode="lp") * rush_env
gurgle = svf(noise(dur), 420, q=4.0) * rush_env * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t))
hiss = svf(noise(dur), 3000, q=0.7) * rush_env * 0.25
write("spuelung", clack * 0.8 + rush + gurgle * 0.8 + hiss + 0 * swirl)
