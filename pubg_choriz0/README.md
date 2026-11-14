# choriz0 · Best of PUBG

Motion design de 26 s en 1080 × 1080. On y voit 6 clips PUBG de choriz0 avec jiomi, mochard et dotvav. La vidéo finit sur Winner Winner Chicken Dinner, #1/100 et le blason #1 mondial. La musique épique et les bruitages sont originaux et générés par code.

| Fichier | Contenu |
|---|---|
| `choriz0_best_of_musique.mp4` | Vidéo avec musique, 1080 × 1080, 30 i/s, 8,9 Mo. C'est celle à envoyer sur Telegram. |
| `choriz0_best_of.gif` | Le même montage en GIF sans son, 480 × 480, 20 i/s, 9,6 Mo. |
| `choriz0_chicken_dinner_loop.gif` | L'écran de fin en boucle continue, 540 × 540, 2,4 s. |
| `choriz0_chicken_dinner_loop.mp4` | La même boucle en MP4 sans son, 1080 × 1080. |

Pour télécharger un fichier depuis GitHub, clique dessus puis sur « Download raw file ».

## Régénérer la vidéo

Il faut Node 18+ avec Playwright et Chromium, Python 3 avec numpy, scipy et pedalboard, ainsi que ffmpeg et gifski.

```sh
cd source
npm install                                                    # polices (Oswald, Teko, Barlow Condensed, Rajdhani)
node render.js --out frames30 --fps 30 --from 0 --to 26.4      # images 1080 px
python3 audio/score.py score.wav                               # musique et bruitages
ffmpeg -framerate 30 -i frames30/f_%05d.png -i score.wav -c:v libx264 -crf 22 -pix_fmt yuv420p \
       -c:a aac -b:a 192k -shortest choriz0_best_of_musique.mp4
```

Le premier rendu recalcule la carte (`assets/map.png`) en quelques secondes.

- L'ordre, la durée et les titres des clips se règlent dans `js/montage.js`.
- Les répliques, les kills et les compteurs se règlent dans `js/timeline.js`.
- La musique et les bruitages se règlent dans `audio/score.py` (100 BPM, une mesure de 2,4 s par coupe).
