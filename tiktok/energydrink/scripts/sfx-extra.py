# Per-video sound effects — #51 Energydrinks, synthesized with the helpers of
# make-sfx.py (t_of, noise, sine, svf, env, write, rng, np).

# "dosenauf": a can being opened — the sharp metal crack of the tab
# (bright partials, very short) followed by the pressurised hiss of the gas
# escaping (band-passed noise that opens up, then dies away).
t = t_of(1.1)
crack = np.zeros_like(t)
for f, a in [(2900, 1.0), (4700, 0.7), (6300, 0.45), (1850, 0.5)]:
    crack += a * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012)
click = svf(noise(1.1), 3800, q=1.2, mode="bp") * np.exp(-t / 0.008) * 1.4
hiss_env = np.clip((t - 0.025) / 0.04, 0, 1) * np.exp(-np.clip(t - 0.06, 0, None) / 0.32)
hiss = svf(noise(1.1), 5200, q=0.6, mode="bp") * hiss_env
fizz = np.zeros_like(t)
for c in rng.uniform(0.08, 0.9, 60):
    i = int(c * 44100)
    n = min(len(t) - i, 90)
    fizz[i : i + n] += rng.uniform(0.1, 0.35) * np.exp(-np.arange(n) / 14)
fizz = svf(fizz, 6000, q=0.7, mode="hp") * np.exp(-t / 0.5)
write("dosenauf", crack + click + 1.1 * hiss + fizz)

# "herzschlag": a heartbeat "lub-dub" — two low thumps (60 / 48 Hz body with
# a soft pitch drop), the second quieter. One beat; beats.js repeats it.
t = t_of(0.55)


def thump(t0, f0, amp):
    tt = np.clip(t - t0, 0, None)
    on = (t >= t0).astype(float)
    f = f0 * (1 + 0.6 * np.exp(-tt / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / 44100
    return on * amp * np.sin(ph) * np.exp(-tt / 0.07) * np.clip(tt / 0.006, 0, 1)


beat = thump(0.0, 62, 1.0) + thump(0.17, 50, 0.7)
beat += 0.25 * svf(noise(0.55), 180, q=0.8, mode="lp") * np.exp(-t / 0.05)
write("herzschlag", beat)
