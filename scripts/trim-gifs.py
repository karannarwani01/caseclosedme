"""Aggressive trim for the two heaviest hover GIFs (WWE, DC).

Caps frames harder than the general pass so these chunky clips shrink without
hurting the others. Reads from public/franchises (restore originals there first).
"""

import os

from PIL import Image, ImageSequence

MAX_DIM = 320
COLORS = 96
MAX_FRAMES = 22
TARGETS = ["public/franchises/hot-wheels.gif", "public/franchises/demon-slayer.gif"]

for path in TARGETS:
    before = os.path.getsize(path)
    im = Image.open(path)

    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        f = fr.convert("RGBA")
        w, h = f.size
        scale = min(1.0, MAX_DIM / max(w, h))
        if scale < 1.0:
            f = f.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
        frames.append(f)
        durations.append(fr.info.get("duration", 80))

    if len(frames) > MAX_FRAMES:
        step = (len(frames) + MAX_FRAMES - 1) // MAX_FRAMES
        kept, kept_dur, acc = [], [], 0
        for i, (f, d) in enumerate(zip(frames, durations)):
            acc += d
            if i % step == 0:
                kept.append(f)
                kept_dur.append(acc)
                acc = 0
        if acc and kept_dur:
            kept_dur[-1] += acc
        frames, durations = kept, kept_dur

    pal = [f.convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=COLORS) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=durations,
                loop=im.info.get("loop", 0), optimize=True, disposal=2)

    after = os.path.getsize(path)
    print(f"{os.path.basename(path):14} {before/1e6:6.2f}MB -> {after/1e6:5.2f}MB  ({len(frames)} frames)")
