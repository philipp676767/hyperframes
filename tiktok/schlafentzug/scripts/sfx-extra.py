# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of noise sine svf env write rng np.
# #43 Schlafentzug: an energy-drink can cracking open on frame 0 — a sharp
# metallic "tsk" (the tab breaking the seal: bright click + ringing partials)
# followed by the carbonation hiss that fades.
t = t_of(1.1)
click = np.zeros_like(t)
i0 = int(0.012 * 44100)
n = 900
click[i0 : i0 + n] = np.exp(-np.arange(n) / 70) * rng.uniform(-1, 1, n)
click = svf(click, 4200, q=1.2, mode="bp") * 2.2
ring = sum(sine(f, t) * a for f, a in [(3150, 0.5), (4870, 0.35), (6420, 0.2)]) * env(t, 0.002, 0.05)
burst = svf(noise(1.1), 5200, q=0.6, mode="hp") * np.exp(-np.maximum(t - 0.03, 0) / 0.08) * (t > 0.03)
hiss = svf(noise(1.1), 7000, q=0.5, mode="hp") * env(t, 0.06, 0.55) * 0.55
write("dose", click + 0.5 * ring + 1.1 * burst + hiss)
