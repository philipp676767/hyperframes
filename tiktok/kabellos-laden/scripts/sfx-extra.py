# #68 Kabellos laden — the video's own sounds (synthesized, no samples):
#   muenze  — a euro coin dropping onto a hard plastic tray: a bright metallic
#             strike (inharmonic partials of a thin disc) + two small bounces
#   ladeton — the soft two-note "charging started" chime of a phone
def coin_strike(t, t0, amp):
    out = np.zeros_like(t)
    tt = np.clip(t - t0, 0, None)
    on = (t >= t0).astype(float)
    for f, a, d in [(2350, 1.0, 0.09), (3730, 0.7, 0.07), (5210, 0.5, 0.05), (6890, 0.35, 0.035), (1480, 0.25, 0.12)]:
        out += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d)
    click = svf(noise(len(t) / 44100), 6000, q=0.7, mode="hp") * np.exp(-tt / 0.004)
    return amp * on * (out + 0.6 * click)

t = t_of(0.6)
write("muenze", coin_strike(t, 0.0, 1.0) + coin_strike(t, 0.11, 0.45) + coin_strike(t, 0.19, 0.2), peak_db=-4)

t = t_of(0.9)
chime = np.zeros_like(t)
for t0, f in [(0.0, 1046.5), (0.13, 1568.0)]:
    tt = np.clip(t - t0, 0, None)
    on = (t >= t0).astype(float)
    chime += on * (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.28)
write("ladeton", chime, peak_db=-5)
