import sys, numpy as np
from scipy.io import wavfile
from scipy import signal
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
sr, x = wavfile.read(sys.argv[1]); x = x.astype(np.float64) / 32768; mono = x.mean(axis=1)
f, t, Z = signal.stft(mono, sr, nperseg=2048, noverlap=1536)
S = 20 * np.log10(np.abs(Z) + 1e-7)
fig, ax = plt.subplots(3, 1, figsize=(18, 11), gridspec_kw={'height_ratios': [3, 1.2, 1.2]}, sharex=True)
ax[0].pcolormesh(t, f, S, vmin=-95, vmax=-20, cmap='magma', shading='auto'); ax[0].set_yscale('symlog', linthresh=200); ax[0].set_ylim(30, 16000); ax[0].set_ylabel('Hz')
hop = int(sr * 0.02); rms = np.sqrt(np.convolve(mono ** 2, np.ones(hop) / hop, mode='same'))[::hop]; tr = np.arange(len(rms)) * 0.02
ax[1].plot(tr, 20 * np.log10(rms + 1e-6), lw=0.8); ax[1].set_ylim(-60, 0); ax[1].set_ylabel('RMS dB')
L, R = x[:, 0], x[:, 1]; side = np.sqrt(np.convolve(((L - R) / 2) ** 2, np.ones(hop) / hop, 'same'))[::hop]
ax[2].plot(tr, 20 * np.log10(side + 1e-6), lw=0.8, color='tab:green'); ax[2].set_ylim(-60, 0); ax[2].set_ylabel('side dB')
marks = {2.4: 'cut1', 6.0: 'cut2', 7.2: 'kar98k', 8.4: 'HEADSHOT', 10.8: 'cut3', 12.3: 'landing', 13.8: 'cut4', 14.68: 'smoke', 17.4: 'cut5', 18.6: 'CLANG', 19.2: 'cut6', 21.0: 'AWM', 21.6: 'WINNER', 22.2: 'CHICKEN', 23.4: 'crest', 24.0: 'loop'}
for a in ax:
    for k, v in marks.items(): a.axvline(k, color='cyan', lw=0.6, alpha=0.7)
for k, v in marks.items(): ax[0].text(k + 0.03, 12000, v, color='cyan', fontsize=8, rotation=90, va='top')
for b in range(12): ax[1].axvline(b * 2.4, color='gray', lw=0.4, ls=':')
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=70)
print('peak', 20 * np.log10(np.abs(x).max()), 'clip>0.98:', int((np.abs(x) > 0.98).sum()), 'dc', mono.mean())
for a, b, name in ((7.3, 8.3, 'bullet-cam drop'), (18.05, 18.55, 'stop-time before CLANG'), (21.05, 21.5, 'after AWM'), (21.6, 24.0, 'bar 10'), (24.0, 26.4, 'bar 11')):
    seg = mono[int(a * sr):int(b * sr)]; print(f'{name:28s} rms {20*np.log10(np.sqrt(np.mean(seg**2))+1e-9):6.1f} dB')
