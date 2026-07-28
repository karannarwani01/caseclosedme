"""Build the Pokemon UPC spec sheet on the standard 1600 grid.

The ETB sheet is the donor: it already carries every line this one needs, the
feature list included - "6 Magnet Closure" happens to be true of both cases. So
its ink is reused wholesale and only the two lines that name the box are reset,
in the same face at the same tracking the sheet already uses. The drawing comes
from the GLB, not from Figma.

Tracking is not guessed: it is solved for on the donor's own words, so the new
words inherit whatever rhythm the sheet was set with.
"""

import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

# Donor sheet, GLB line drawing, and output. The donor is any existing sheet
# already on the standard grid - download one off the CDN if there is no local
# copy. Inter Tight Medium is what the range is set in; Google Fonts has it.
DONOR = os.environ.get("DONOR", "specs/norm-etb.jpg")
DRAWING = os.environ.get("DRAWING", "draw_upc.png")
FONT = os.environ.get("FONT", "InterTight-500.ttf")
OUT = os.environ.get("OUT", "spec-tcg-upc-a4.jpg")
CANVAS = 1600

# Lines to reset: (band box on the sheet, donor words, replacement words, right limit)
# "ULTRA PREMIUM COLLECTION" is a longer name than the donor's, and the title
# block's 827 width is the grid's fixed reference - it cannot grow to suit. So
# the title line is allowed to set a little smaller rather than run into the
# frame's right border. The free-standing FITS line has no such limit.
SWAPS = [
    ((113, 287, 596, 320), "FOR ELITE TRAINER BOX",
     "FOR ULTRA PREMIUM COLLECTION", 786),
    ((4, 680, 472, 706), "FITS 1 X ELITE TRAINER BOX",
     "FITS 1 X ULTRA PREMIUM COLLECTION", None),
]


def ink(path):
    return np.array(Image.open(path).convert("L")) < 128


def split(path):
    """Donor sheet -> text mask, drawing mask, caption mask."""
    m = ink(path)
    lab, n = ndimage.label(m, np.ones((3, 3)))
    comps = []
    for sl, i in zip(ndimage.find_objects(lab), range(1, n + 1)):
        ys, xs = sl
        comps.append({"id": i, "px": int((lab[sl] == i).sum()),
                      "x0": xs.start, "x1": xs.stop, "y0": ys.start, "y1": ys.stop})
    main = max(comps, key=lambda c: c["px"])
    text, draw, cap = [], [main["id"]], []
    for c in comps:
        if c["id"] == main["id"]:
            continue
        inside = (c["x0"] >= main["x0"] and c["x1"] <= main["x1"]
                  and c["y0"] >= main["y0"] and c["y1"] <= main["y1"])
        (draw if inside else text if c["x1"] < 900 else cap).append(c["id"])
    return np.isin(lab, text), np.isin(lab, draw), np.isin(lab, cap)


def typeset(text, size, track):
    f = ImageFont.truetype(FONT, size)
    im = Image.new("L", (2400, 240), 255)
    d = ImageDraw.Draw(im)
    x = 60.0
    for ch in text:
        d.text((x, 60), ch, font=f, fill=0)
        x += f.getlength(ch) + track
    a = np.array(im) < 128
    ys, xs = np.nonzero(a)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def solve(donor_text, cap_h, width):
    """Find the size and tracking that reproduce the donor's own setting."""
    for size in range(cap_h, cap_h * 3):
        probe = typeset(donor_text, size, 0)
        if probe.shape[0] != cap_h:
            continue
        lo, hi = -6.0, 6.0
        for _ in range(40):
            mid = (lo + hi) / 2
            if typeset(donor_text, size, mid).shape[1] < width:
                lo = mid
            else:
                hi = mid
        return size, (lo + hi) / 2
    raise SystemExit(f"no size gives cap height {cap_h}")


def span_fill(m):
    f = np.logical_or.accumulate(m, 1) & np.logical_or.accumulate(m[:, ::-1], 1)[:, ::-1]
    g = np.logical_or.accumulate(m, 0) & np.logical_or.accumulate(m[::-1], 0)[::-1]
    return f & g


def main():
    text, _, cap = split(DONOR)

    # Blank the two lines that name the box, then reset them.
    for (x0, y0, x1, y1), _, _, _ in SWAPS:
        text[y0 - 2:y1 + 2, x0 - 2:x1 + 2] = False

    out = Image.new("RGB", (CANVAS, CANVAS), (255, 255, 255))
    out.paste(Image.fromarray(np.where(text, 0, 255).astype(np.uint8)).convert("RGB"), (0, 0))

    for (x0, y0, x1, y1), old, new, right in SWAPS:
        size, track = solve(old, y1 - y0, x1 - x0)
        bm = typeset(new, size, track)
        while right and x0 + bm.shape[1] > right and size > 8:
            track *= size / (size + 1)  # tracking is in px, so it shrinks too
            size -= 1
            bm = typeset(new, size, track)
        img = Image.fromarray(np.where(bm, 0, 255).astype(np.uint8)).convert("RGB")
        # Sit on the donor's baseline, not its cap line - a line that had to set
        # smaller would otherwise float above the row it belongs to.
        top = y1 - bm.shape[0]
        out.paste(img, (x0, top), Image.fromarray((bm * 255).astype(np.uint8)))
        print(f"  '{new}'  size {size} track {track:+.2f} -> "
              f"{bm.shape[1]}x{bm.shape[0]} at ({x0},{top}), right edge {x0 + bm.shape[1]}")

    ys, xs = np.nonzero(cap)
    cimg = Image.fromarray(np.where(cap, 0, 255).astype(np.uint8)).convert("RGB")
    cimg = cimg.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    out.paste(cimg, (1597 - cimg.width, 154))

    # Drawing: as large as it will go without touching the text. Collide against
    # the case's filled silhouette - it is hollow line art, so an ink-only test
    # would happily park the feature list inside the box.
    d = ink(DRAWING)
    ys, xs = np.nonzero(d)
    dmask = d[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    solid = span_fill(dmask)
    placed = np.array(out.convert("L")) < 128
    keep_out = ndimage.binary_dilation(placed, np.ones((23, 23)))

    RIGHT, BOTTOM, TOP_BLEED = CANVAS - 4, CANVAS, 0.10

    def fits(s):
        w = max(1, round(dmask.shape[1] * s))
        h = max(1, round(dmask.shape[0] * s))
        x, y = RIGHT - w, BOTTOM - h
        if y < -TOP_BLEED * h or x < 0:
            return None
        m = np.array(Image.fromarray(solid.astype(np.uint8) * 255)
                     .resize((w, h), Image.LANCZOS)) > 110
        cm = np.zeros((CANVAS, CANVAS), bool)
        sy, sx = max(0, -y), max(0, -x)
        vy = min(CANVAS - max(0, y), h - sy)
        vx = min(CANVAS - max(0, x), w - sx)
        cm[max(0, y):max(0, y) + vy, max(0, x):max(0, x) + vx] = m[sy:sy + vy, sx:sx + vx]
        return None if (cm & keep_out).any() else (w, h, x, y)

    lo, hi, best = 0.20, 2.00, None
    for _ in range(24):
        mid = (lo + hi) / 2
        got = fits(mid)
        if got:
            best, lo = (mid, got), mid
        else:
            hi = mid
    s, (w, h, x, y) = best
    dimg = Image.open(DRAWING).convert("RGB").crop(
        (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)).resize((w, h), Image.LANCZOS)
    # Paste through the line work itself - a plain paste drops an opaque white
    # rectangle on the page and quietly erases whatever text it covers.
    out.paste(dimg, (x, y), dimg.convert("L").point(lambda v: 255 - v))
    print(f"  drawing scale {s:.3f} -> {w}x{h} at ({x},{y})")

    out.save(OUT, quality=94, subsampling=0)
    print("saved", OUT)


if __name__ == "__main__":
    main()
