# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of noise sine svf env write rng np.
# #48 Touchscreen: "tock" = a fingertip (or a sausage) tapping the glass,
# "knack" = the display glass cracking into a spider web.

# tock: a short knock on glass — a damped mid "body" + a bright click
t = t_of(0.18)
body = sine(820, t) * np.exp(-t / 0.018) + 0.5 * sine(1650, t) * np.exp(-t / 0.01)
click = svf(noise(0.18), 4200, q=0.9, mode="bp") * np.exp(-t / 0.004)
thud = svf(noise(0.18), 300, q=0.7, mode="lp") * np.exp(-t / 0.03)
write("tock", 0.9 * body + 0.8 * click + 1.4 * thud)

# knack: glass cracking — a sharp crack, then a run of tiny bright ticks that
# spread outward (the web growing), a little ring of the glass at the end
t = t_of(0.75)
crack = svf(noise(0.75), 3000, q=0.7, mode="hp") * np.exp(-t / 0.012)
ticks = np.zeros_like(t)
for c in np.sort(rng.uniform(0.01, 0.42, 28)):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    ticks[i : i + n] += rng.uniform(0.3, 1.0) * np.exp(-np.arange(n) / 14) * (1.0 - c)
ticks = svf(ticks, 5200, q=1.2, mode="hp")
ring = (sine(2900, t) + 0.6 * sine(4350, t)) * env(t, 0.005, 0.35) * 0.18
low = svf(noise(0.75), 220, q=0.8, mode="lp") * np.exp(-t / 0.05)
write("knack", 1.3 * crack + 1.1 * ticks + ring + 0.9 * low)
