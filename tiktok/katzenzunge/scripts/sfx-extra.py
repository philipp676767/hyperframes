# #80 Katzenzunge — the topic's own sounds, synthesized like the house kit.

# A cat's lick: a short wet rasp — band-passed noise with a fast grainy
# amplitude flutter (the hooks catching), a quick swell and a soft decay.
t = t_of(0.32)
rasp = svf(noise(0.32), 3200, q=1.4, mode="bp")
grain = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 95 * t + 3 * np.sin(2 * np.pi * 7 * t)))
wet = svf(noise(0.32), 900, q=0.9, mode="lp") * 0.5
write("lecken", (rasp * grain + wet) * env(t, 0.04, 0.22))

# A purr: ~25 Hz pulses of a low buzzy tone (breathing in and out), soft.
t = t_of(4.5)
pulse = 0.5 + 0.5 * np.sin(2 * np.pi * 25 * t)
pulse = pulse ** 3
breath = 0.65 + 0.35 * np.sin(2 * np.pi * 0.55 * t)
body = svf(noise(4.5), 180, q=1.2, mode="lp") * 2.5 + 0.4 * sine(50, t)
write("schnurren", body * pulse * breath * env(t, 0.3, 4.0), peak_db=-6)
