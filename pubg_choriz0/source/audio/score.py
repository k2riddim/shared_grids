#!/usr/bin/env python3
"""Original epic trailer score + synced sound design for 'choriz0 · Best Of' (26.4 s).
100 BPM (beat 0.6 s, bar 2.4 s), D minor -> D major for the win. Everything is synthesised here."""
import re, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile
from pedalboard import Pedalboard, Reverb, Compressor, Limiter, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter

SR = 44100
BEAT, S16, BAR = 0.6, 0.15, 2.4
DUR = 26.4
N = int(round(DUR * SR))
TAIL = 4 * SR
rng = np.random.default_rng(20261114)

# ───────────────────────── helpers ─────────────────────────
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def m2f(m): return 440.0 * 2 ** ((m - 69) / 12)
def n2m(s):
    a = re.match(r'([A-G][#b]?)(-?\d)', s); return 12 * (int(a.group(2)) + 1) + NOTE[a.group(1)]
def fq(s): return m2f(n2m(s))
def tt(n): return np.arange(n) / SR

class Bus:
    def __init__(self): self.x = np.zeros((2, N + TAIL))
    def add(self, sig, t0, pan=0.0, gain=1.0):
        if sig.ndim == 1:
            a = (pan + 1) * np.pi / 4; sig = np.stack([sig * np.cos(a), sig * np.sin(a)])
        i0 = int(round(t0 * SR)); n = sig.shape[1]
        s0 = max(0, -i0); i0 = max(0, i0); i1 = min(self.x.shape[1], i0 + n - s0)
        if i1 > i0: self.x[:, i0:i1] += gain * sig[:, s0:s0 + (i1 - i0)]

def saw(freq, n, ph0=None):
    f = np.broadcast_to(np.asarray(freq, float), (n,)).copy()
    dt = f / SR
    ph = ((rng.random() if ph0 is None else ph0) + np.cumsum(dt)) % 1.0
    s = 2 * ph - 1
    m = ph < dt; x = ph[m] / dt[m]; s[m] -= x + x - x * x - 1
    m = ph > 1 - dt; x = (ph[m] - 1) / dt[m]; s[m] -= x * x + x + x + 1
    return s
def sine(freq, n, ph0=0.0):
    f = np.broadcast_to(np.asarray(freq, float), (n,))
    return np.sin(2 * np.pi * (ph0 + np.cumsum(f) / SR))
def noise(n): return rng.standard_normal(n)
def _sos(kind, fc, order=2):
    if kind == 'band': return signal.butter(order, [max(20, fc[0]) / (SR / 2), min(SR * 0.45, fc[1]) / (SR / 2)], 'band', output='sos')
    return signal.butter(order, min(SR * 0.45, max(20, fc)) / (SR / 2), kind, output='sos')
def lp(x, fc, o=2): return signal.sosfilt(_sos('low', fc, o), x)
def hp(x, fc, o=2): return signal.sosfilt(_sos('high', fc, o), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(_sos('band', (lo, hi), o), x)
def sweep(x, fcs, kind='low', width=0.35, block=256):
    """time-varying filter: fcs is an array of cut-offs (or centres for 'band')"""
    y = np.zeros_like(x); zi = None
    for i in range(0, len(x), block):
        c = float(fcs[min(i, len(fcs) - 1)])
        sos = _sos('band', (c * (1 - width), c * (1 + width))) if kind == 'band' else _sos(kind, c)
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    return y
def env_ar(n, a, r, hold):
    t = tt(n); e = np.minimum(1, t / max(a, 1e-4))
    return e * np.where(t < hold, 1.0, np.exp(-(t - hold) / max(r, 1e-4) * 5))
def norm(x, peak=1.0):
    m = np.max(np.abs(x)); return x * (peak / m) if m > 0 else x

# ───────────────────────── instruments ─────────────────────────
def str_note(f, dur, vel=1.0, bright=1.0):
    n = int((dur + 0.12) * SR); t = tt(n)
    x = (saw(f * 0.997, n) + saw(f, n) + saw(f * 1.0035, n)) / 3
    e = np.minimum(1, t / 0.004) * (0.55 + 0.45 * np.exp(-t * 22)) * np.where(t < dur, 1, np.exp(-(t - dur) * 40))
    return lp(x * e, 1400 + 2400 * vel * bright) * vel
def low_str(f, dur, vel=1.0):
    n = int((dur + 0.5) * SR)
    x = saw(f * 0.998, n) + saw(f * 1.002, n) + 0.6 * saw(f * 0.5, n)
    return lp(x * env_ar(n, 0.08, 0.4, dur), 480) * vel * 0.3
def pad(freqs, dur, vel=0.5, fc=1500):
    n = int((dur + 0.9) * SR)
    x = sum(saw(f * (1 + d), n) for f in freqs for d in (-0.005, 0.0045))
    return hp(lp(x * env_ar(n, 0.35, 0.7, dur), fc), 140) * vel / len(freqs)
def choir(freqs, dur, vowel='ah', vel=0.6, att=0.4):
    n = int((dur + 1.0) * SR); t = tt(n); vs = []
    for f in freqs:
        for d in (-0.009, -0.003, 0.002, 0.008):
            vib = 1 + 0.0045 * np.sin(2 * np.pi * (5.1 + 9 * d) * t + rng.random() * 6.28)
            vs.append(saw(f * (1 + d) * vib, n))
    x = sum(vs) / len(vs)
    F = {'ah': [(730, 1.0), (1150, 0.6), (2550, 0.28)], 'oo': [(330, 1.0), (820, 0.4), (2300, 0.12)]}[vowel]
    y = sum(g * bp(x, fc * 0.82, fc * 1.18) for fc, g in F)
    return hp(y, 160) * env_ar(n, att, 0.8, dur) * vel * 3.2
def brass(f, dur, vel=1.0):
    n = int((dur + 0.4) * SR); t = tt(n)
    vib = 1 + 0.0035 * np.sin(2 * np.pi * 5.4 * t) * np.minimum(1, t / 0.5)
    x = saw(f * vib, n) + saw(f * 1.004 * vib, n) + 0.55 * saw(f * 0.5 * vib, n)
    e = np.minimum(1, t / 0.035) * (0.8 + 0.2 * np.exp(-t * 4)) * np.where(t < dur, 1, np.exp(-(t - dur) * 12))
    fc = 450 + 2600 * np.minimum(1, t / 0.06) * np.exp(-t * 2.2) + 1100 * vel
    return np.tanh(sweep(x * e, fc) * 1.6) * vel * 0.55
def braam(root, dur=2.4, vel=1.0, third=None):
    n = int((dur + 0.6) * SR); t = tt(n)
    fr = [root / 2, root, root * 1.5, root * 2] + ([third] if third else [])
    x = sum((0.45 if f == root / 2 else 1.0) * saw(f * (1 + d), n) for f in fr for d in (-0.006, 0.0, 0.006)) / (3 * len(fr))
    fc = 140 + 2600 * np.minimum(1, t / 0.12) * np.exp(-t * 1.6) + 260
    x = sweep(x, fc)
    e = np.minimum(1, t / 0.03) * np.exp(-t * 0.8) * np.where(t < dur, 1, np.exp(-(t - dur) * 6))
    return np.tanh(x * e * 3.0) * vel
def taiko(vel=1.0, f0=58, decay=7.0, slap=0.5, length=1.1):
    n = int(length * SR); t = tt(n)
    body = sine(f0 + 85 * np.exp(-t * 28), n) * np.exp(-t * decay)
    sl = bp(noise(n), 180, 2200) * np.exp(-t * 55)
    return np.tanh((body + slap * sl * 0.7) * 1.6) * vel
def sub_boom(vel=1.0, f0=42, length=2.4):
    n = int(length * SR); t = tt(n)
    s = sine(f0 + 110 * np.exp(-t * 14), n) * np.exp(-t * 1.9)
    cr = bp(noise(n), 900, 6000) * np.exp(-t * 60) * 0.6
    return np.tanh((s + cr) * 2.0) * vel
def crash(vel=0.6, length=2.8):
    n = int(length * SR); t = tt(n)
    x = hp(noise(n), 4200) * 0.8 + bp(noise(n), 6000, 11000) * 0.6
    return x * np.minimum(1, t / 0.002) * np.exp(-t * 1.5) * vel * 0.5
def hat(vel=0.3):
    n = int(0.07 * SR); return hp(noise(n), 7500) * np.exp(-tt(n) * 85) * vel
def snare(vel=0.7):
    n = int(0.45 * SR); t = tt(n)
    return (bp(noise(n), 900, 6000) * np.exp(-t * 20) * 0.9 + sine(190 + 60 * np.exp(-t * 40), n) * np.exp(-t * 28) * 0.6) * vel
def tom(vel=0.7, f0=95):
    return taiko(vel, f0=f0, decay=10, slap=0.35, length=0.6)
def bell(f, vel=0.4, length=2.2):
    n = int(length * SR); t = tt(n)
    parts = [(1, 1.0, 2.2), (2.0, 0.45, 3.2), (3.01, 0.28, 4.5), (4.2, 0.18, 6.0), (5.43, 0.1, 8.0)]
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in parts) * np.minimum(1, t / 0.002) * vel
def riser(length, vel=0.6, f_from=300, f_to=7000):
    n = int(length * SR); t = tt(n); u = t / length
    x = sweep(noise(n), f_from * (f_to / f_from) ** u, 'band', 0.45) * (u ** 2.2)
    tone = sine(180 * (6.5 ** u), n) * (u ** 3) * 0.12
    return (x + tone) * vel
def rev_swell(length, vel=0.7):
    c = crash(1.0, length=length + 0.2)[: int(length * SR)][::-1]
    n = len(c); u = tt(n) / length
    w = sweep(noise(n), 400 * (14 ** u), 'band', 0.5) * u ** 2 * 0.6
    return (c + w) * vel
def whoosh(length, vel=0.6, f_from=500, f_to=2500):
    n = int(length * SR); t = tt(n); u = t / length
    x = sweep(noise(n), f_from * (f_to / f_from) ** u, 'band', 0.4) * np.sin(np.pi * np.clip(u, 0, 1)) ** 1.5
    return x * vel
def heartbeat(vel=0.6):
    n = int(0.6 * SR); t = tt(n)
    lub = sine(52 + 30 * np.exp(-t * 30), n) * np.exp(-t * 16)
    dub = np.zeros(n); k = int(0.22 * SR); dub[k:] = sine(46 + 25 * np.exp(-tt(n - k) * 30), n - k) * np.exp(-tt(n - k) * 18) * 0.7
    return np.tanh((lub + dub) * 1.8) * vel
# ── sfx ──
def gunshot(kind='kar', vel=1.0):
    P = {'kar': (0.9, 11, 5.0, 900), 'm4': (0.55, 22, 11.0, 1400), 'awm': (1.25, 7, 2.6, 700), 'far': (0.35, 18, 6.0, 500)}[kind]
    boomamp, bdec, tdec, tlp = P
    n = int(2.2 * SR); t = tt(n)
    crack = hp(noise(n), 1800) * np.exp(-t * 260) * 1.3
    boom = sine(48 + 120 * np.exp(-t * 35), n) * np.exp(-t * bdec) * boomamp
    tail = lp(noise(n), tlp) * np.exp(-t * tdec) * 0.55
    x = crack + boom + tail
    if kind == 'far': x = lp(x, 1600) * 0.7
    if kind == 'awm':  # valley echoes
        for d, g in ((0.27, 0.35), (0.55, 0.2), (0.9, 0.1)):
            k = int(d * SR); x[k:] += lp(x[:n - k], 900) * g
    return np.tanh(x * 1.4) * vel
def ting(vel=0.8, f0=2300):
    n = int(1.4 * SR); t = tt(n)
    parts = [(1, 1, 6), (1.63, 0.6, 7), (2.21, 0.45, 9), (3.07, 0.3, 12), (4.4, 0.15, 15)]
    x = sum(a * np.sin(2 * np.pi * f0 * r * t + rng.random()) * np.exp(-t * d) for r, a, d in parts)
    x += hp(noise(n), 3000) * np.exp(-t * 120) * 0.6
    return x * vel * 0.5
def clang(vel=1.0, f0=330):
    n = int(3.0 * SR); t = tt(n)
    wob = 1 + 0.004 * np.sin(2 * np.pi * 6 * t) * np.exp(-t * 2)
    parts = [(1, 1.0, 1.8), (2.31, 0.7, 2.6), (3.87, 0.5, 3.4), (5.43, 0.38, 4.2), (7.12, 0.25, 5.5), (9.4, 0.15, 7.0)]
    x = sum(a * np.sin(2 * np.pi * f0 * r * wob * t + rng.random() * 6) * np.exp(-t * d) for r, a, d in parts)
    x += sine(165, n) * np.exp(-t * 4) * 0.8 + bp(noise(n), 1500, 9000) * np.exp(-t * 70) * 1.2
    return np.tanh(x * 0.9) * vel
def thud(vel=0.8, f0=55):
    n = int(0.9 * SR); t = tt(n)
    return np.tanh((sine(f0 + 70 * np.exp(-t * 25), n) * np.exp(-t * 9) + lp(noise(n), 500) * np.exp(-t * 18) * 0.7) * 1.8) * vel
def hiss(length, vel=0.3):
    n = int(length * SR); t = tt(n); u = t / length
    return hp(noise(n), 2200) * np.minimum(1, t / 0.08) * (1 - u) ** 1.6 * vel
def click(vel=0.35, f=1900):
    n = int(0.05 * SR); t = tt(n)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 120) + hp(noise(n), 4000) * np.exp(-t * 300) * 0.5) * vel
def rack(vel=0.7):
    n = int(0.45 * SR); x = np.zeros(n)
    for d, f in ((0.0, 2600), (0.16, 1700)):
        k = int(d * SR); m = n - k; tm = tt(m)
        x[k:] += (bp(noise(m), f * 0.6, f * 1.6) * np.exp(-tm * 70) + np.sin(2 * np.pi * f * 0.5 * tm) * np.exp(-tm * 90) * 0.4)
    return x * vel
def chime(vel=0.35):
    return bell(fq('D6'), vel, 1.6) + bell(fq('A6'), vel * 0.6, 1.6)
def whizz(vel=0.5):
    n = int(0.22 * SR); t = tt(n); u = t / 0.22
    x = sweep(noise(n), 4500 * (0.35 ** u), 'band', 0.25) * np.sin(np.pi * u) ** 2
    return x * vel
def glitch(vel=0.35):
    n = int(0.09 * SR); x = noise(n)
    hold = np.repeat(x[::40], 40)[:n]
    return hp(hold, 300) * np.exp(-tt(n) * 25) * vel
def plane_drone(length, vel=0.5):
    n = int(length * SR); t = tt(n); u = t / length
    am = 1 + 0.55 * np.sin(2 * np.pi * 19 * t)
    x = (saw(84 * (1.02 - 0.04 * u), n) + 0.6 * saw(168 * (1.02 - 0.04 * u), n)) * am
    x = lp(x, 900) + lp(noise(n), 300) * 0.8
    e = np.sin(np.pi * np.clip(u, 0, 1)) ** 0.8
    L = x * e * np.clip(0.5 - 0.5 * (1.6 * u - 0.8), 0.15, 1); R = x * e * np.clip(0.5 + 0.5 * (1.6 * u - 0.8), 0.15, 1)
    return np.stack([R, L]) * vel  # plane flies right -> left

# ───────────────────────── montage clock (mirror of montage.js) ─────────────────────────
CLIPS = {
    'call': (2.4, [[0, 2.8], [3.6, 6.12]]),
    'wipe': (6.0, [[0, 6.42], [0.6, 7.2], [1.2, 8.05], [2.4, 8.86], [2.55, 8.98], [4.8, 11.45]]),
    'crate': (10.8, [[0, 11.85], [1.5, 13.36], [3.0, 14.95]]),
    'revive': (13.8, [[0, 15.6], [3.6, 19.78]]),
    'pan': (17.4, [[0, 19.5], [1.05, 19.935], [1.45, 20.0], [1.8, 20.7]]),
    'final': (19.2, [[0, 20.6], [1.8, 21.92], [2.4, 22.9], [7.2, 27.7]]),
}
def M(clip, ts):
    a, S = CLIPS[clip]
    for i in range(len(S) - 1):
        if ts <= S[i + 1][1]:
            return a + S[i][0] + (S[i + 1][0] - S[i][0]) * (ts - S[i][1]) / (S[i + 1][1] - S[i][1])
    return a + S[-1][0] + (ts - S[-1][1])
CUTS = [2.4, 6.0, 10.8, 13.8, 17.4, 19.2]
def bt(bar, s16=0.0): return (bar - 1) * BAR + s16 * S16

# ───────────────────────── score ─────────────────────────
mus, drm, sfx = Bus(), Bus(), Bus()
CHORDS = {1: ('D3', 'min'), 2: ('D3', 'min'), 3: ('Bb2', 'maj'), 4: ('F3', 'maj'), 5: ('C3', 'maj'), 6: ('D3', 'min'), 7: ('Bb2', 'maj'),
          8: ('G2', 'min'), 9: ('A2', 'maj'), 10: ('D3', 'maj'), 11: ('D3', 'maj')}
def tones(bar):
    r, q = CHORDS[bar]; m = n2m(r); return m, m + (3 if q == 'min' else 4), m + 7
PAT = [0, 0, 12, 0, 0, 12, 0, 12, 0, 0, 12, 0, 7, 12, 7, 'T']
ACC = {0, 3, 6, 8, 11, 14}
def ostinato(bar, s_from=0, s_to=16, vel=1.0, bright=1.0):
    r, th, fi = tones(bar)
    for s in range(s_from, s_to):
        p = PAT[s]; m = th + 12 if p == 'T' else r + p
        v = (1.0 if s in ACC else 0.62) * vel
        t0 = bt(bar, s)
        mus.add(str_note(m2f(m), S16 * 0.82, v, bright), t0, pan=-0.35, gain=0.42)
        mus.add(str_note(m2f(m - 12), S16 * 0.82, v * 0.8, bright * 0.7), t0 + 0.004, pan=0.35, gain=0.2)
def groove(bar, s_from=0, s_to=16, vel=1.0, half=False):
    for s in range(s_from, s_to):
        t0 = bt(bar, s)
        big = [0, 8] if half else [0, 3, 6, 8, 11, 14]
        if s in big: drm.add(taiko(vel * (1.0 if s in (0, 8) else 0.7)), t0, pan=0.0, gain=0.9)
        if s in (4, 12) and not half: drm.add(snare(0.55 * vel), t0, pan=0.05, gain=0.7)
        if half and s == 8: drm.add(snare(0.7 * vel), t0, gain=0.8)
        drm.add(hat((0.32 if s % 4 == 2 else 0.18) * vel), t0, pan=0.4 if s % 2 else -0.2, gain=0.6)
def hit(t0, vel=1.0, big=False, chord_bar=None):
    drm.add(sub_boom(vel), t0, gain=0.95)
    for d, p in ((0.0, -0.3), (0.012, 0.3), (0.02, 0.0)): drm.add(taiko(vel, f0=52 + 6 * p), t0 + d, pan=p, gain=0.55)
    drm.add(crash(0.75 * vel), t0, pan=0.2, gain=0.8)
    if chord_bar:
        r, th, fi = tones(chord_bar)
        mus.add(braam(m2f(r - 12), 2.4, vel * (1.0 if big else 0.75), third=m2f(th) if big else None), t0, gain=0.55 if big else 0.4)
def lowline(bar, length=BAR, vel=1.0):
    r, th, fi = tones(bar)
    mus.add(low_str(m2f(r - 12), length, vel), bt(bar), gain=0.9)
def padbar(bar, length=BAR, vel=0.5, up=12):
    r, th, fi = tones(bar)
    mus.add(pad([m2f(r + up), m2f(th + up), m2f(fi + up)], length, vel), bt(bar), gain=0.55)

# BAR 1 — intro: drone, ticks on the teaser strobe, riser into the first cut
mus.add(low_str(fq('D2'), 2.4, 0.9), 0.0, gain=0.8)
mus.add(pad([fq('D3'), fq('A3')], 2.2, 0.45, fc=900), 0.0, gain=0.6)
for k in range(16): drm.add(hat(0.16 + 0.1 * (k % 4 == 0)), k * S16, pan=0.3 if k % 2 else -0.3, gain=0.6)
drm.add(taiko(0.55, f0=50), 0.0, gain=0.8); drm.add(taiko(0.45, f0=50), 1.2, gain=0.8)
sfx.add(thud(0.55, 48), 0.27, gain=0.8)                         # title slam
sfx.add(whoosh(0.45, 0.25, 2000, 7000), 0.66, pan=-0.2, gain=0.7)  # underline sweep
for i in range(4): sfx.add(click(0.22, 1500 + 150 * i), (0.78 + i * 0.08) * 1.1, pan=-0.3 + 0.2 * i)
mus.add(riser(1.6, 0.55), 0.8, gain=0.9)
# BARS 2-3 — the call
hit(2.4, 1.0, chord_bar=2)
for b in (2, 3): lowline(b); padbar(b, vel=0.35)
ostinato(2); groove(2)
ostinato(3, 0, 8); groove(3, 0, 8)
# call-clip sounds
sfx.add(bell(fq('D6'), 0.35, 1.2), M('call', 3.55), pan=0.2)        # pin dropped
sfx.add(whoosh(0.5, 0.22, 1500, 6000), M('call', 3.95), pan=0.3)   # next zone draws itself
sfx.add(thud(0.5, 70), M('call', 4.45), gain=0.7); sfx.add(bell(fq('A5'), 0.3), M('call', 4.45), pan=0.3)  # ZONE CALLÉE
for i in range(4): sfx.add(click(0.3, 880), M('call', 4.9 + i * 0.06), pan=0.4)                          # enemies spotted
sfx.add(whoosh(0.35, 0.3, 600, 3000), M('call', 6.0) - 0.05, gain=0.8)                                     # dive
# BAR 3 beats 3-4 — the wipe clip opens: aiming, suspense into the shot
hit(6.0, 0.8, chord_bar=3)
ostinato(3, 8, 16, vel=0.55, bright=0.45)
for s in range(8, 16): drm.add(hat(0.14), bt(3, s), gain=0.5)
for s in (12, 13, 14, 15): drm.add(tom(0.35 + 0.1 * (s - 12), 120 - 6 * (s - 12)), bt(3, s), pan=-0.2 + 0.1 * (s - 12), gain=0.7)
mus.add(riser(0.9, 0.35, 500, 5000), 6.3, gain=0.8)
sfx.add(heartbeat(0.5), 6.6, gain=0.9)
# BAR 4 — Kar98k shot on the downbeat, bullet-cam drop, HEADSHOT on beat 3
sfx.add(gunshot('kar', 1.0), 7.2, gain=1.0)
sfx.add(low_str(fq('F2'), 1.1, 0.9), 7.25, gain=0.9)
sfx.add(whoosh(1.15, 0.55, 380, 160), 7.22, pan=-0.2, gain=1.0)        # slow-motion bullet
sfx.add(whoosh(1.1, 0.18, 3000, 9000), 7.25, pan=0.25, gain=0.8)       # air shimmer
sfx.add(rev_swell(0.5, 0.5), 7.9, gain=0.9)
hit(8.4, 1.0, big=True, chord_bar=4)
sfx.add(ting(1.0), 8.4, pan=0.1, gain=1.0)
ostinato(4, 8, 16); groove(4, 8, 16); mus.add(low_str(m2f(tones(4)[0] - 12), 1.2, 1.0), 8.4, gain=0.9)
# M416 sprays (3 targets × 4 rounds) + casings
for die in (9.86, 10.32, 10.8):
    for d in (0.2, 0.14, 0.08, 0.02): sfx.add(gunshot('m4', 0.75), M('wipe', die - d), pan=0.05, gain=0.75)
    for j in range(3): sfx.add(click(0.12, 5200 + 700 * j), M('wipe', die) + 0.2 + 0.07 * j, pan=0.5, gain=0.7)
# BAR 5 — rolling, then the airdrop cut on beat 3
lowline(5); padbar(5, vel=0.35); ostinato(5, 0, 8); groove(5, 0, 8)
sfx.add(whoosh(0.35, 0.3, 500, 2600), 10.8 - 0.32, gain=0.8)
hit(10.8, 0.9, chord_bar=5)
# airdrop: half-time, brass call over the plane
ostinato(5, 8, 16, vel=0.8); groove(5, 8, 16, half=True)
sfx.add(plane_drone(1.9, 0.55), 10.8, gain=0.9)
sfx.add(whoosh(0.45, 0.45, 300, 900), M('crate', 12.12) - 0.05, pan=0.2, gain=0.9)   # chute opens
for b, notes in ((5, [('C4', 0, 4), ('E4', 4, 2), ('G4', 6, 2)]), (6, [('A4', 0, 6), ('F4', 6, 2), ('D4', 8, 4)])):
    for nm, s0, ln in notes:
        if bt(b, s0) >= 11.4: mus.add(brass(fq(nm), ln * S16 * 0.95, 0.8), bt(b, s0), pan=-0.1, gain=0.42)
# BAR 6 — landing, smoke, loot, ambush cut on beat 4
lowline(6); padbar(6, vel=0.4); ostinato(6, 0, 12, vel=0.9); groove(6, 0, 8, half=True)
sfx.add(thud(1.0, 50), M('crate', 13.36), gain=1.0); sfx.add(hiss(1.5, 0.22), M('crate', 13.36) + 0.05, pan=0.35)
sfx.add(gunshot('far', 0.6), M('crate', 13.95), pan=-0.6); sfx.add(gunshot('far', 0.6), M('crate', 13.95) + 0.07, pan=-0.6); sfx.add(gunshot('far', 0.6), M('crate', 13.95) + 0.14, pan=-0.6)
sfx.add(gunshot('far', 0.75), M('crate', 14.45), pan=0.6)
sfx.add(rack(0.8), M('crate', 14.36), pan=-0.2)
for i in range(1, 7): sfx.add(click(0.22, 1700 + 80 * i), M('crate', 14.36 + i * 0.07), pan=-0.3)
for s in (8, 9, 10, 11): drm.add(tom(0.5 + 0.12 * (s - 8), 130 - 12 * (s - 8)), bt(6, s), pan=-0.3 + 0.2 * (s - 8), gain=0.8)
sfx.add(whoosh(0.3, 0.3, 500, 2600), 13.8 - 0.28, gain=0.8)
hit(13.8, 1.0, chord_bar=6)
# revive clip: ambush gunfire, smoke, three revives, choir grows with each teammate back up
for s in (15.64, 15.7, 15.76, 15.83, 15.9, 15.97, 16.04, 16.1, 16.17):
    m = M('revive', s); sfx.add(whizz(0.45), m - 0.05, pan=0.6, gain=0.8); sfx.add(gunshot('m4', 0.45), m, pan=0.75, gain=0.6); sfx.add(thud(0.25, 90), m + 0.06, pan=0.1, gain=0.6)
for s in (15.74, 15.92, 16.1): mus.add(low_str(fq('D1'), 0.4, 0.6), M('revive', s), gain=0.5)
sfx.add(click(0.3, 3200), M('revive', 16.25), pan=0.5); sfx.add(whoosh(0.35, 0.3, 800, 2400), M('revive', 16.28), pan=0.3)
sfx.add(thud(0.6, 80), M('revive', 16.62), gain=0.9); sfx.add(hiss(2.6, 0.35), M('revive', 16.62), pan=-0.1, gain=1.0)
lowline(7); ostinato(7, vel=0.95); groove(7, vel=0.9)
ostinato(6, 12, 16, vel=0.9); groove(6, 12, 16)
revs = [M('revive', s) for s in (17.6, 18.56, 19.52)]
voices = [fq('D4'), fq('F4'), fq('A4')]
for i, rt in enumerate(revs):
    sfx.add(chime(0.4), rt, pan=-0.2 + 0.2 * i)
    mus.add(choir(voices[: i + 1] + [fq('D5')] * (i == 2), max(0.5, 17.4 - rt + 0.4), 'ah', 0.5), rt, gain=0.5)
# BAR 8 — revive ends, the pan: stop-time and CLANG on beat 4
lowline(8, 1.2); ostinato(8, 0, 8, vel=0.9); groove(8, 0, 8)
sfx.add(whoosh(0.3, 0.3, 500, 2600), 17.4 - 0.28, gain=0.8)
hit(17.4, 0.8, chord_bar=8)
sfx.add(whoosh(0.5, 0.8, 250, 1400), M('pan', 19.8), pan=-0.4, gain=1.0)
sfx.add(clang(1.0), 18.6, gain=1.0); drm.add(sub_boom(0.8), 18.6, gain=0.8)
sfx.add(thud(0.5, 60), M('pan', 20.45), pan=0.3)
sfx.add(rev_swell(0.42, 0.6), 18.78, gain=0.9)
# BAR 9 — final circle: A pedal, heartbeat, tremolo, riser, AWM on beat 4, freeze, reverse swell
hit(19.2, 0.9, chord_bar=9)
mus.add(low_str(fq('A1'), 1.8, 0.9), 19.2, gain=0.9)
for k in range(int(1.8 / 0.075)):
    tk = 19.2 + k * 0.075
    mus.add(str_note(fq('A5') if k % 2 else fq('E5'), 0.06, 0.35 + 0.4 * k / 24, 0.6), tk, pan=0.3, gain=0.22)
for k in range(3): sfx.add(heartbeat(0.55 + 0.1 * k), 19.5 + k * 0.6, gain=0.9)
mus.add(riser(1.75, 0.5, 300, 9000), 19.25, gain=0.8)
sfx.add(whoosh(0.6, 0.2, 400, 900), M('final', 21.35), gain=0.7)       # hold breath
sfx.add(gunshot('awm', 1.0), 21.0, gain=1.0)
sfx.add(ting(0.9, 2000), M('final', 22.02), pan=0.1); sfx.add(thud(0.5, 70), M('final', 22.02), gain=0.6)
n_ring = int(0.4 * SR); sfx.add(np.sin(2 * np.pi * 3400 * tt(n_ring)) * np.linspace(0.06, 0, n_ring), M('final', 22.28))   # time stops
sfx.add(rev_swell(0.48, 0.8), 21.6 - 0.48, gain=1.0)
sfx.add(choir([fq('D4'), fq('F#4'), fq('A4')], 0.4, 'ah', 0.35, att=0.35)[::-1][: int(0.45 * SR)], 21.15, gain=0.6)
# BAR 10 — WINNER WINNER CHICKEN DINNER (D major)
hit(21.6, 1.25, big=True, chord_bar=10)
sfx.add(glitch(0.3), 21.6)
mus.add(choir([fq('D4'), fq('F#4'), fq('A4'), fq('D5')], 4.6, 'ah', 0.7, att=0.15), 21.6, gain=0.75)
lowline(10); padbar(10, vel=0.45); ostinato(10); groove(10, vel=1.05)
for nm, s0, ln in (('D4', 0, 4), ('F#4', 4, 2), ('A4', 6, 2), ('D5', 8, 8)):
    mus.add(brass(fq(nm), ln * S16 * 0.95, 1.0), bt(10, s0), gain=0.55)
    mus.add(brass(fq(nm) / 2, ln * S16 * 0.95, 0.8), bt(10, s0), pan=0.25, gain=0.35)
drm.add(taiko(0.9), 21.7, gain=0.6); drm.add(crash(0.5), 22.2, pan=-0.2, gain=0.7); drm.add(taiko(1.0, f0=54), 22.2, gain=0.8)
for i in range(4): sfx.add(click(0.18, 1400 + 200 * i), M('final', 23.85 + i * 0.06), pan=-0.4 + 0.25 * i)
hit(23.4, 1.0, chord_bar=10)
for i, nm in enumerate(('D6', 'F#6', 'A6', 'D7')): sfx.add(bell(fq(nm), 0.22, 1.6), 23.4 + 0.05 + i * 0.04, pan=-0.3 + 0.2 * i)
# BAR 11 — the loop bar: lighter D major, bells, settles on D
lowline(11, vel=0.8); padbar(11, vel=0.4); ostinato(11, vel=0.75, bright=0.8)
for s in range(16):
    drm.add(hat(0.14 + 0.08 * (s % 4 == 0)), bt(11, s), pan=0.3 if s % 2 else -0.3, gain=0.55)
    if s in (0, 8): drm.add(taiko(0.6), bt(11, s), gain=0.7)
arp = ['D5', 'F#5', 'A5', 'D6', 'A5', 'F#5', 'D5', 'A4']
for i, nm in enumerate(arp): sfx.add(bell(fq(nm), 0.18, 1.4), bt(11, i * 2), pan=-0.4 + 0.1 * i, gain=0.8)
for nm, s0, ln in (('A4', 0, 4), ('F#4', 4, 4), ('D4', 8, 8)):
    mus.add(brass(fq(nm), ln * S16 * 0.95, 0.6), bt(11, s0), gain=0.35)
# cut glitches (match the picture's glitch slices)
for c in CUTS: sfx.add(glitch(0.28), c, pan=0.0, gain=0.8)

# ───────────────────────── mix & master ─────────────────────────
def fx(bus, board): y = board(bus.x.astype(np.float32), SR); return y.astype(np.float64)
mus_w = fx(mus, Pedalboard([HighpassFilter(45), LowShelfFilter(cutoff_frequency_hz=180, gain_db=-5), PeakFilter(cutoff_frequency_hz=320, gain_db=-3, q=0.9), HighShelfFilter(cutoff_frequency_hz=7000, gain_db=2), Reverb(room_size=0.86, damping=0.45, wet_level=0.30, dry_level=0.80, width=1.0)]))
drm_w = fx(drm, Pedalboard([HighpassFilter(30), Compressor(threshold_db=-12, ratio=3, attack_ms=4, release_ms=120), Reverb(room_size=0.7, damping=0.5, wet_level=0.16, dry_level=0.9, width=0.9)]))
sfx_w = fx(sfx, Pedalboard([HighpassFilter(30), Reverb(room_size=0.55, damping=0.5, wet_level=0.14, dry_level=0.95, width=0.8)]))
def automation(points):
    ts = np.arange(N + TAIL) / SR
    return 10 ** (np.interp(ts, [p[0] for p in points], [p[1] for p in points]) / 20)
cut = automation([(0, 0), (7.22, 0), (7.3, -32), (8.34, -32), (8.4, 0), (18.0, 0), (18.08, -34), (18.55, -34), (18.59, 0),
                  (21.0, 0), (21.05, -30), (21.55, -30), (21.6, 0), (40, 0)])
mus_w *= cut; drm_w *= cut
mix = norm(mus_w, 1) * 0.6 + norm(drm_w, 1) * 0.78 + norm(sfx_w, 1) * 0.72
master = Pedalboard([HighpassFilter(34), LowShelfFilter(cutoff_frequency_hz=95, gain_db=-5.5), PeakFilter(cutoff_frequency_hz=2800, gain_db=1.5, q=0.7), Compressor(threshold_db=-12, ratio=2.0, attack_ms=15, release_ms=220), Limiter(threshold_db=-1.2, release_ms=120)])
out = master((mix * 1.1).astype(np.float32), SR).astype(np.float64)[:, :N]
fade = int(0.3 * SR); out[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
out[:, :int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
out = norm(out, 10 ** (-1.0 / 20))
path = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
wavfile.write(path, SR, (out.T * 32767).astype(np.int16))
rms = np.sqrt(np.mean(out ** 2)); print(f'wrote {path}: {out.shape[1] / SR:.2f}s, peak {20 * np.log10(np.max(np.abs(out))):.1f} dBFS, rms {20 * np.log10(rms):.1f} dBFS')
