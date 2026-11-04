# Per-video sound effects — the topic's own sounds, synthesized with the
# helpers of make-sfx.py: t_of(dur), noise(dur), sine(freq, t),
# svf(x, cutoff, q, mode), env(t, a, d), write(name, x, peak_db=-3), rng, np
# #55 Fingerknacken: "knack" — a knuckle crack. Physics: the joint cavity
# forms in < 1 ms → a sharp broadband click, a short resonant "tock" of the
# finger (~1.6–2.6 kHz, decays in ~15 ms), a tiny low thump of the hand,
# often doubled by a second smaller click a few ms later.
t = t_of(0.18)
sr = 44100
click = np.zeros_like(t)
for off, amp in ((0.0, 1.0), (0.007, 0.45), (0.016, 0.2)):
    i = int(off * sr)
    n = min(len(t) - i, 90)
    click[i : i + n] += amp * np.exp(-np.arange(n) / 9) * rng.choice([-1, 1], n)
tock = (np.sin(2 * np.pi * 2100 * t) * 0.7 + np.sin(2 * np.pi * 1450 * t) * 0.5) * np.exp(-t / 0.014)
thump = np.sin(2 * np.pi * (180 - 400 * t) * t) * np.exp(-t / 0.03)
body = svf(noise(0.18), 3200, q=1.4, mode="bp") * np.exp(-t / 0.01)
write("knack", 1.2 * click + 0.6 * tock + 0.55 * thump + 0.5 * body)
