# Per-video sound effects for #69 Weinen im Weltall (synthesized, no samples):
#   quindar — the short radio beep of space comms (2525 Hz tone, ~0.25 s)
#   atmen   — breathing inside the helmet: a filtered inhale + exhale, close and dry
t = t_of(0.3)
tone = sine(2525, t) * env(t, 0.005, 0.25)
tone *= (t < 0.25)
write("quindar", tone)

t = t_of(2.3)
n = noise(2.3)
inh = svf(n, 1400, q=1.2, mode="bp")
exh = svf(n, 700, q=0.9, mode="bp")
k_in = np.clip(t / 0.8, 0, 1) * np.clip((1.0 - t) / 0.2, 0, 1)
k_ex = np.clip((t - 1.15) / 0.15, 0, 1) * np.clip((2.3 - t) / 1.0, 0, 1)
write("atmen", inh * k_in * 0.8 + exh * k_ex)
