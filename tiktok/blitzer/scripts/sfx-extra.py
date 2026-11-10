# #64 Blitzer — the topic's own sounds, synthesized with the helpers of
# make-sfx.py (t_of, noise, sine, svf, env, write, rng, np).

# blitz: a speed camera's flash — a short rising charge whine, then the
# sharp snap of the xenon tube with a tiny low thump
t = t_of(0.75)
whine_t = np.clip(t / 0.22, 0, 1)
whine = sine(2400 + 6800 * whine_t**1.6, t) * (0.12 * whine_t) * (t < 0.24)
snap_t = np.maximum(0, t - 0.24)
snap = svf(noise(0.75), 5200, q=0.9, mode="hp") * env(snap_t, 0.0015, 0.035) * (t >= 0.24)
thump = sine(95 * np.exp(-snap_t * 6), t) * env(snap_t, 0.003, 0.09) * (t >= 0.24)
tail = svf(noise(0.75), 2600, q=1.2, mode="bp") * env(snap_t, 0.01, 0.18) * 0.25 * (t >= 0.24)
write("blitz", whine + 1.4 * snap + 0.9 * thump + tail)

# reifen: tyres squealing under hard braking — a narrow, wobbling band of
# noise around 1.4 kHz that slides down as the car slows
t = t_of(1.1)
wob = 1400 - 260 * t + 90 * np.sin(2 * np.pi * 13 * t) + 40 * np.sin(2 * np.pi * 31 * t)
squeal = svf(noise(1.1), wob, q=14, mode="bp")
tone = sine(wob, t) * 0.35
road = svf(noise(1.1), 400, q=0.7, mode="lp") * 0.25
write("reifen", (squeal + tone + road) * env(t, 0.06, 0.55))

# sirene: a German two-tone siren (Martinshorn, ~440 / ~587 Hz) driving past
# — louder and higher while it comes closer, lower after it has passed
dur = 3.2
t = t_of(dur)
seq = np.where((t % 1.3) < 0.65, 440.0, 587.0)
doppler = 1.06 - 0.12 / (1 + np.exp(-(t - 1.7) * 5))  # +6 % coming, -6 % going
f = seq * doppler
tone = sum(sine(f * k, t) / k for k in (1, 3, 5, 7))
tone = svf(tone, 1600, q=0.8, mode="lp")
loud = 0.35 + 0.65 * np.exp(-((t - 1.7) / 0.9) ** 2)
write("sirene", tone * loud * env(t, 0.15, 6.0))
