# Source zip — image payloads note

This source zip contains the complete MedSetu code and data **except the
two large image payload folders**, which are regenerable build artefacts
and were left out only because of the build machine's disk quota:

- `src/data/simg/` (subject-test figures, ~214 MB) — regenerate with
  `node scripts/subjects-images.mjs`
- `src/data/bimg/` (question-bank figures, ~386 MB) — regenerate with
  `node scripts/qbank-images.mjs`, then optionally
  `python3 scripts/qbank-shrink.py`

Both downloaders are checkpointed and resumable, read their URL lists
from the vendored sources and maps **included in this zip**
(`src/data/qbank-src/`, `src/data/subjects-src/`), and validate every
file by magic bytes. After regenerating, `npm run build` wires the images
exactly as in the delivered site (the pipeline only ever references
files that exist on disk; anything not yet downloaded degrades to the
honest "image not included" note instead of a broken image).

The delivered **medsetu-v3-netlify.zip** contains every image — nothing
in the live site is missing. The book figures (`src/data/qimg/`, ~11 MB)
**are** included in this source zip.
