# #62 Sneaker-Sohle — the video's own sounds (synthesized):
#   quietsch — a sneaker squeaking on the court: a gliding, rough resonance
#              around 2–3 kHz with a fast warble (rubber stick-slip)
#   ball     — a basketball bouncing on the court: a deep hollow thud with a
#              short ringing body tone

# quietsch: 0.32 s, pitch glides 2300 → 3100 Hz, stick-slip AM at ~55 Hz
t = t_of(0.32)
f = 2300 + 800 * (t / t[-1]) ** 0.7
ph = 2 * np.pi * np.cumsum(f) / 44100
tone = np.sin(ph) + 0.45 * np.sin(2 * ph + 0.3) + 0.2 * np.sin(3 * ph)
am = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 55 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
rough = svf(noise(0.32), 2800, q=4, mode="bp") * 0.35
e = env(t, 0.015, 0.22) * np.clip((t[-1] - t) / 0.05, 0, 1)
write("quietsch", (tone * am + rough) * e, peak_db=-4)

# ball: 0.45 s — 120 Hz thud dropping to 80 Hz + a 420 Hz "pong" ring + slap
t = t_of(0.45)
f = 120 * np.exp(-t * 2.5) + 80
thud = np.sin(2 * np.pi * np.cumsum(f) / 44100) * env(t, 0.002, 0.12)
ring = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 14) * 0.35
slap = svf(noise(0.45), 1800, q=0.7, mode="lp") * np.exp(-t * 60) * 0.8
write("ball", thud + ring + slap)
