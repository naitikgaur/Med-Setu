#!/usr/bin/env python3
"""One-off maintenance for the question-bank images: re-encode oversized
files as WebP (quality 85) when that makes them smaller.

Why: this machine's home quota is nearly full (see QBANK-REPORT.md) and the
publisher originals include many multi-hundred-KB scans. The figures are
unchanged in content — same pixels, recompressed — and the image map is
updated so the pipeline wires the new file names. Files <= 150 KB, SVGs and
already-small WebPs are left untouched. Safe to re-run (idempotent).
"""
import io
import json
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..")
MAP_PATH = os.path.join(ROOT, "src/data/qbank-src/image-map.json")
IMG_DIR = os.path.join(ROOT, "src/data/bimg")
THRESHOLD = 150 * 1024

with open(MAP_PATH) as f:
    img_map = json.load(f)

saved = 0
changed = 0
for url, entry in img_map.items():
    if not entry.get("ok"):
        continue
    name = entry["file"]
    path = os.path.join(IMG_DIR, name)
    if not os.path.exists(path):
        continue
    size = os.path.getsize(path)
    if size <= THRESHOLD or name.endswith((".svg", ".webp", ".gif")):
        continue
    try:
        with Image.open(path) as im:
            im.load()
            if im.mode in ("RGBA", "LA", "P"):
                im = im.convert("RGBA")
            else:
                im = im.convert("RGB")
            buf = io.BytesIO()
            im.save(buf, "WEBP", quality=85, method=4)
        data = buf.getvalue()
    except Exception as e:  # unreadable image — leave it as-is
        print(f"skip {name}: {e}")
        continue
    if len(data) >= size:
        continue
    new_name = name.rsplit(".", 1)[0] + ".webp"
    new_path = os.path.join(IMG_DIR, new_name)
    with open(new_path, "wb") as f:
        f.write(data)
    if new_path != path:
        os.remove(path)
    entry["file"] = new_name
    saved += size - len(data)
    changed += 1

with open(MAP_PATH, "w") as f:
    json.dump(img_map, f)

print(f"recompressed {changed} files, saved {saved / 1048576:.0f} MB")
