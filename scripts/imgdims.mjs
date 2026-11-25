import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function imageDims(buf) {
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  }
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
  }
  if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fmt = buf.toString('ascii', 12, 16);
    if (fmt === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
    if (fmt === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
    if (fmt === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    return null;
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return [buf.readUInt16BE(off + 7), buf.readUInt16BE(off + 5)];
      }
      const len = buf.readUInt16BE(off + 2);
      if (!len) break;
      off += 2 + len;
    }
  }
  return null;
}

export function scanDirs(root, dirs) {
  const out = {};
  let found = 0, missed = 0;
  for (const d of dirs) {
    const dir = join(root, 'src', 'data', d);
    for (const f of readdirSync(dir)) {
      try {
        const buf = readFileSync(join(dir, f));
        const dims = imageDims(buf);
        if (dims) { out[`/${d}/${f}`] = `${dims[0]}x${dims[1]}`; found++; }
        else missed++;
      } catch { missed++; }
    }
  }
  return { out, found, missed };
}

if (process.argv[1] && process.argv[1].endsWith('imgdims-gen.mjs')) {
  const root = process.argv[2];
  const { out, found, missed } = scanDirs(root, ['qimg', 'simg', 'bimg']);
  writeFileSync(join(root, 'src', 'data', 'imgdims.json'), JSON.stringify(out));
  console.log(`imgdims: ${found} measured, ${missed} skipped, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
}
