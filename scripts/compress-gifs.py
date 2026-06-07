"""One-off: downscale + quantize the franchise hover GIFs.

The circles render at ~112-192px (≤384px retina), so full-res source GIFs are
wildly oversized. This caps the longest edge at MAX_DIM, decimates frames on the
heaviest clips, and quantizes the palette — typically a 5-20x size cut with no
visible loss at circle scale. Re-runnable; originals are backed up once.
"""

import glob
import os
import shutil

from PIL import Image, ImageSequence

SRC_DIR = "public/franchises"
BACKUP_DIR = "gif-originals"  # outside public/, not served
MAX_DIM = 360
COLORS = 128
MAX_FRAMES = 48  # decimate clips with more frames than this

os.makedirs(BACKUP_DIR, exist_ok=True)

total_before = total_after = 0
for path in sorted(glob.glob(f"{SRC_DIR}/*.gif")):
    name = os.path.basename(path)
    backup = os.path.join(BACKUP_DIR, name)
    if not os.path.exists(backup):
        shutil.copy2(path, backup)

    before = os.path.getsize(backup)
    im = Image.open(backup)

    frames, durations = [], []
    for fr in ImageSequence.Iterator(im):
        f = fr.convert("RGBA")
        w, h = f.size
        scale = min(1.0, MAX_DIM / max(w, h))
        if scale < 1.0:
            f = f.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
        frames.append(f)
        durations.append(fr.info.get("duration", 80))

    # Decimate long clips: keep every Nth frame, fold dropped time into the kept one.
    if len(frames) > MAX_FRAMES:
        step = (len(frames) + MAX_FRAMES - 1) // MAX_FRAMES
        kept, kept_dur = [], []
        acc = 0
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
    pal[0].save(
        path,
        save_all=True,
        append_images=pal[1:],
        duration=durations,
        loop=im.info.get("loop", 0),
        optimize=True,
        disposal=2,
    )

    # Some sources are already well-optimized (good inter-frame compression);
    # our re-encode can come out larger. Never regress — keep the smaller file.
    if os.path.getsize(path) >= before:
        shutil.copy2(backup, path)
        note = " (kept original — already smaller)"
    else:
        note = ""

    after = os.path.getsize(path)
    total_before += before
    total_after += after
    print(f"{name:22} {before/1e6:6.2f}MB -> {after/1e6:5.2f}MB  ({len(frames)} frames){note}")

print(f"\nTOTAL {total_before/1e6:.2f}MB -> {total_after/1e6:.2f}MB "
      f"({100*(1-total_after/total_before):.0f}% smaller)")
