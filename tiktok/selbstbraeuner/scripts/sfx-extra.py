# #76 Selbstbräuner — own sounds (synthesized, see make-sfx.py helpers)

# lotion rubbed on skin: soft, wet, rhythmic swish (hand going back and forth)
t = t_of(1.3)
am = 0.5 - 0.5 * np.cos(2 * np.pi * 3.6 * t)
wet = svf(noise(1.3), 1800, q=1.4, mode="bp") * am
squish = svf(noise(1.3), 600, q=2.0, mode="bp") * am ** 3
write("reiben", (wet + 0.8 * squish) * env(t, 0.04, 0.5), peak_db=-6)

# toaster pop: the latch clack + the spring's metallic twang + bread rattle
t = t_of(0.9)
clack = svf(noise(0.9), 2500, q=1.2, mode="bp") * np.exp(-t / 0.012)
twang = (
    sine(820 * (1 + 0.04 * np.exp(-t / 0.05)), t) * np.exp(-t / 0.22)
    + 0.6 * sine(1640, t) * np.exp(-t / 0.12)
    + 0.35 * sine(2470, t) * np.exp(-t / 0.08)
)
rattle = np.zeros_like(t)
for c in [0.05, 0.11, 0.16]:
    i = int(c * 44100)
    n = min(len(t) - i, 900)
    rattle[i : i + n] += rng.uniform(0.3, 0.6) * np.exp(-np.arange(n) / 120)
rattle = svf(rattle * noise(0.9), 1200, q=0.9, mode="bp")
write("toaster", 2.2 * clack + 0.5 * twang + rattle)
