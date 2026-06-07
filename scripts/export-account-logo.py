"""Compose a caseclosed header lockup (ink cube + wordmark) for the Shopify
New Customer Accounts logo slot. Transparent background, ink color so it reads
on a light/paper page background. Outputs a retina-sized PNG.
"""

from PIL import Image, ImageDraw, ImageFont

INK = (13, 10, 26, 255)  # #0d0a1a — anime-ink
WORD = "caseclosed"
FONT_PX = 240            # large render, trimmed afterwards
GAP = 48                 # space between cube and wordmark
PAD = 48                 # uniform transparent padding around the lockup
OUT = "scripts/account-logo.png"

font = ImageFont.truetype("scripts/bricolage.ttf", FONT_PX)

# --- render wordmark on its own transparent canvas, then trim ---
tmp = Image.new("RGBA", (FONT_PX * len(WORD), FONT_PX * 2), (0, 0, 0, 0))
d = ImageDraw.Draw(tmp)
d.text((0, 0), WORD, font=font, fill=INK)
word_img = tmp.crop(tmp.getbbox())
wm_w, wm_h = word_img.size

# --- scale the ink cube to sit a touch taller than the wordmark ---
cube = Image.open("public/logo-cube-ink.png").convert("RGBA")
cube = cube.crop(cube.getbbox())
target_h = int(wm_h * 1.35)
scale = target_h / cube.height
cube = cube.resize((round(cube.width * scale), target_h), Image.LANCZOS)

# --- compose horizontally, vertically centered ---
content_h = max(cube.height, wm_h)
total_w = PAD + cube.width + GAP + wm_w + PAD
total_h = PAD + content_h + PAD
canvas = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
canvas.alpha_composite(cube, (PAD, PAD + (content_h - cube.height) // 2))
canvas.alpha_composite(word_img, (PAD + cube.width + GAP, PAD + (content_h - wm_h) // 2))

canvas.save(OUT)
print(f"saved {OUT}  {canvas.size[0]}x{canvas.size[1]}px")
