# #77 Nasse Haare — own sounds, synthesized with the helpers of make-sfx.py
# (t_of, noise, sine, svf, env, write, rng, np).

# eisknistern: wet hair freezing — a rising swarm of tiny bright ice clicks + a glassy shimmer
t = t_of(1.1)
clicks = np.zeros_like(t)
for c in np.sort(rng.uniform(0.0, 0.9, 46)):
    i = int(c * 44100)
    n = min(len(t) - i, 120)
    clicks[i : i + n] += rng.uniform(0.3, 1.0) * (0.4 + c) * np.exp(-np.arange(n) / 14) * rng.choice([-1, 1])
shimmer = (sine(5200, t) + 0.6 * sine(7300, t) + 0.4 * sine(9100, t)) * env(t, 0.25, 0.5) * 0.08
write("eisknistern", svf(clicks, 4200, q=0.9, mode="hp") + shimmer)

# knack: a frozen strand snaps — one hard dry crack with a short icy ring
t = t_of(0.35)
crack = noise(0.35) * np.exp(-t / 0.006)
ring = (sine(3100, t) + 0.5 * sine(4700, t)) * np.exp(-t / 0.05) * 0.35
thud = sine(190, t) * np.exp(-t / 0.03) * 0.5
write("knack", svf(crack, 1800, q=0.7, mode="hp") * 1.6 + ring + thud)
