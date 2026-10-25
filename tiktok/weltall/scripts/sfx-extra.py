# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of(dur), noise(dur), sine(freq, t), svf(x,
# cutoff, q, mode), env(t, a, d), write(name, x, peak_db=-3), rng, np.
# Each write("name", …) becomes assets/sfx-extra/name.wav (beats.js SFX).

# herzschlag: a calm heartbeat, "lub-dub" every 0.85 s for 3.4 s — low sine
# thumps with a falling pitch and a touch of filtered noise for the skin
dur = 3.4
t = t_of(dur)
x = np.zeros_like(t)
def thump(at, f0, amp):
    i = int(at * 44100)
    n = min(len(t) - i, int(0.22 * 44100))
    tt = np.arange(n) / 44100
    f = f0 * (1 + 0.6 * np.exp(-tt / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / 44100
    x[i : i + n] += amp * np.sin(ph) * np.exp(-tt / 0.06) * (1 - np.exp(-tt / 0.004))
for k in range(4):
    b = 0.05 + k * 0.85
    thump(b, 58, 1.0)
    thump(b + 0.17, 50, 0.7)
skin = svf(noise(dur), 180, q=0.7, mode="lp") * 0.15
write("herzschlag", x + skin * (np.abs(x) > 0.05))
