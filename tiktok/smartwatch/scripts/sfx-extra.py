# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py:
#   t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode), env(t, a, d),
#   write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav, usable in beats.js
# SFX like a kit sound: { s: "name", at: T.x }.

# #44 Smartwatch: a heartbeat, "lub-dub" — two low thumps (~55 / 48 Hz with
# a quick pitch drop) 0.28 s apart, the second softer, plus a little
# low-passed noise for the body.
t = t_of(0.75)


def thump(t0, f0, amp):
    tt = np.clip(t - t0, 0, None)
    f = f0 * (1 + 0.8 * np.exp(-tt / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / 44100
    e = (t >= t0) * (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.07)
    body = svf(noise(0.75), 180, q=0.7, mode="lp") * e * 0.6
    return amp * (np.sin(ph) * e + body)


write("herzschlag", thump(0.0, 58, 1.0) + thump(0.28, 50, 0.7))
