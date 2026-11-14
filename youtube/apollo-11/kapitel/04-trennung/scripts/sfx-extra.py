# YouTube #1 Apollo 11 — the video's own sounds (same file in every chapter).
# alarm1202: the LM master alarm — a harsh two-tone beep, 3 bursts
t = t_of(1.4)
gate = ((t % 0.36) < 0.22).astype(float)
tone = np.sign(sine(760, t)) * 0.5 + np.sign(sine(1520, t)) * 0.25
write("alarm1202", svf(tone, 4200, q=0.7, mode="lp") * gate * env(t, 0.005, 1.2), peak_db=-6)
# quindar: the NASA radio beep at the start of a transmission (2525 Hz, 250 ms)
t = t_of(0.3)
write("quindar", sine(2525, t) * ((t < 0.25).astype(float)) * env(t, 0.004, 0.26), peak_db=-9)
# triebwerk: a steady rocket-engine roar (loop it with dur)
t = t_of(4.0)
roar = svf(noise(4.0), 380, q=0.6, mode="lp") + 0.35 * svf(noise(4.0), 1400, q=0.5, mode="bp")
roar *= 1 + 0.15 * sine(7, t)
write("triebwerk", roar * np.minimum(1, t / 0.15), peak_db=-6)
# start: the Saturn V ignition — a deep crackling thunder that swells
t = t_of(6.0)
thunder = svf(noise(6.0), 160, q=0.7, mode="lp") * 1.6 + svf(noise(6.0), 900, q=0.5, mode="bp") * 0.5
cr = np.zeros_like(t)
for c in rng.uniform(0.2, 5.8, 70):
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    cr[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 120)
write("startdonner", (thunder + svf(cr, 2000, q=0.6, mode="hp") * 0.6) * np.minimum(1, t / 1.2), peak_db=-3)
