# #67 own sounds (synthesized with make-sfx.py's helpers):
#   splash    — the full glass tips over: a glassy clink + water slosh and spray
#   heartbeat — one fast lub-dub cycle (0.62 s ≈ 97 bpm), looped via `dur`

# splash: clink (bright partials, fast decay) + low slosh + hissing spray
t = t_of(1.1)
clink = sum(
    a * sine(f, t) * np.exp(-t * d)
    for f, a, d in [(2650, 0.5, 30), (4180, 0.35, 38), (5900, 0.2, 45)]
)
slosh = svf(noise(1.1), 380, q=1.6, mode="bp") * env(t, 0.05, 0.35)
gurgle = sum(
    0.25 * sine(300 + 500 * rng.uniform(), t) * env(np.clip(t - s, 0, None), 0.005, 0.05) * (t > s)
    for s in rng.uniform(0.08, 0.5, 7)
)
spray = svf(noise(1.1), 5200, q=0.7, mode="hp") * env(np.clip(t - 0.08, 0, None), 0.04, 0.45)
write("splash", 0.6 * clink + 1.4 * slosh + gurgle + 0.5 * spray)

# heartbeat: two low thumps per cycle
t = t_of(0.62)


def thump(at, f, a):
    tt = np.clip(t - at, 0, None)
    return a * np.sin(2 * np.pi * f * tt * (1 - 0.35 * np.clip(tt / 0.12, 0, 1))) * np.exp(-tt * 26) * (t >= at)


write("heartbeat", thump(0.0, 62, 1.0) + thump(0.17, 52, 0.7) + 0.15 * svf(noise(0.62), 120, q=0.9, mode="lp") * env(t, 0.01, 0.08))
