# Own sounds of #70 Hundenase (synthesized, see make-sfx.py helpers).

# Sniffing: 6 quick nasal inhales at ~5 Hz — band-passed breath noise with a
# fast rise and a short tail, a little pitch rise per sniff.
def sniff_burst(dur, n, rate=5.2):
    t = t_of(dur)
    out = np.zeros_like(t)
    for k in range(n):
        i = int((k / rate) * 44100)
        L = int(0.13 * 44100)
        if i + L > len(t):
            break
        seg = noise(0.13)
        seg = svf(seg, 2400 + 300 * (k % 2), q=1.6, mode="bp")
        tt = np.arange(L) / 44100
        e = np.minimum(tt / 0.025, 1.0) * np.exp(-np.maximum(tt - 0.025, 0) / 0.045)
        out[i : i + L] += seg * e * (0.8 + 0.2 * rng.uniform())
    return out
write("schnueffel", sniff_burst(1.4, 7))

# Lick: a wet slap — low-passed noise smack + a tiny resonant "schlurp".
t = t_of(0.45)
smack = svf(noise(0.45), 900, q=1.2, mode="bp") * env(t, 0.008, 0.07)
slurp = svf(noise(0.45), 1600, q=6.0, mode="bp") * env(t, 0.06, 0.18) * 0.7
write("schlabber", smack + slurp)
