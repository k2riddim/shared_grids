# usage: python3 tools/sheet.py out.png cols thumb img1 img2 ...
import sys, os
from PIL import Image, ImageDraw
out, cols, th = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); files = sys.argv[4:]
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * th, rows * (th + 18)), (20, 20, 20))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((th, th), Image.LANCZOS)
    x, y = (i % cols) * th, (i // cols) * (th + 18)
    sheet.paste(im, (x, y + 18)); d.text((x + 4, y + 3), os.path.basename(f), fill=(230, 230, 230))
sheet.save(out)
