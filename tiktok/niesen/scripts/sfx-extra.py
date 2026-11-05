# Per-video sound effects — #61 Niesen. Synthesized with the helpers of
# make-sfx.py: t_of(dur), noise(dur), sine(freq, t), svf(x, cutoff, q, mode),
# env(t, a, d), write(name, x, peak_db=-3), rng (seeded), np
# Each write("name", …) becomes assets/sfx-extra/name.wav.

SR = 44100


def breath(dur, f0, f1, q=2.2, gain=1.0):
    """Breathy inhale: noise through a band-pass whose centre glides up."""
    t = t_of(dur)
    n = noise(dur)
    out = np.zeros_like(t)
    steps = 24
    seg = len(t) // steps
    for k in range(steps):
        a, b = k * seg, len(t) if k == steps - 1 else (k + 1) * seg
        f = f0 + (f1 - f0) * (k / (steps - 1)) ** 1.4
        out[a:b] = svf(n[a:b], f, q=q, mode="bp")
    shape = np.minimum(1.0, t / (dur * 0.75)) ** 1.6 * np.exp(-np.maximum(0, t - dur * 0.85) * 30)
    return out * shape * gain


# "ah … aah …" — two rising inhales before the sneeze (frame 0, and the chest)
t1 = t_of(1.25)
a1 = breath(0.5, 500, 1300)
a2 = breath(0.7, 650, 1700, gain=1.3)
ein = np.zeros_like(t1)
ein[: len(a1)] += a1
o = int(0.52 * SR)
ein[o : o + len(a2)] += a2[: len(ein) - o]
write("einatmen", ein, peak_db=-4)

# "HA-TSCHI": a short voiced "ha" (formant buzz) + the explosive hiss burst
t = t_of(0.85)
ha_t = t_of(0.16)
buzz = sum(sine(180 * h, ha_t) / h for h in range(1, 9))
ha = svf(buzz, 900, q=1.4, mode="bp") * env(ha_t, 0.01, 0.07)
burst = svf(noise(0.85), 4200, q=0.7, mode="bp") * env(t, 0.004, 0.16)
air = svf(noise(0.85), 1200, q=0.6, mode="lp") * env(t, 0.01, 0.32) * 0.6
thump = sine(70, t) * np.exp(-t * 18) * 0.8
hatschi = burst * 1.4 + air + thump
o = int(0.04 * SR)
hatschi[: len(ha)] += ha * 0.7
hatschi = np.concatenate([np.zeros(o), hatschi])[: len(t)]
write("hatschi", hatschi)

# stifled sneeze: the burst trapped behind a closed mouth — dull "mpf" + a
# low thud in the chest
t = t_of(0.5)
mpf = svf(noise(0.5), 380, q=0.9, mode="lp") * env(t, 0.006, 0.09)
thud = sine(55, t) * np.exp(-t * 14)
write("mpf", mpf * 1.6 + thud, peak_db=-5)
