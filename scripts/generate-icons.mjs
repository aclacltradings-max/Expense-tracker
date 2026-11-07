// Generates the PWA icon set without any image dependencies.
// Draws the naira glyph (₦) on a teal tile, supersampled for smooth edges.
//
//   node scripts/generate-icons.mjs
//
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../public/icons');

/* ---------------------------------------------------------------- PNG --- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  const stride = size * 4;
  const source = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length);
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type: none
    source.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* -------------------------------------------------------------- colour --- */

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/* -------------------------------------------------------------- shapes --- */

const SAMPLES = 4; // subsamples per axis => 16 samples per pixel

function inRoundedRect(x, y, radius) {
  const r = Math.min(radius, 0.5);
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function onSegment(x, y, ax, ay, bx, by, halfWidth) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq ? Math.min(Math.max(((x - ax) * dx + (y - ay) * dy) / lengthSq, 0), 1) : 0;
  const px = ax + t * dx - x;
  const py = ay + t * dy - y;
  return px * px + py * py <= halfWidth * halfWidth;
}

// The naira sign: two verticals joined by a diagonal, crossed by two bars.
const GLYPH_STROKES = [
  [0.3, 0.27, 0.3, 0.73, 0.052],
  [0.7, 0.27, 0.7, 0.73, 0.052],
  [0.3, 0.27, 0.7, 0.73, 0.052],
  [0.19, 0.44, 0.81, 0.44, 0.042],
  [0.19, 0.6, 0.81, 0.6, 0.042],
];

function glyphCoverage(x, y) {
  for (const [ax, ay, bx, by, halfWidth] of GLYPH_STROKES) {
    if (onSegment(x, y, ax, ay, bx, by, halfWidth)) return true;
  }
  return false;
}

/* ------------------------------------------------------------ renderer --- */

function renderIcon(size, { bleed, radius, inset }) {
  const pixels = new Uint8Array(size * size * 4);
  const top = hexToRgb('#14b8a6');
  const bottom = hexToRgb('#0f766e');
  const sampleStep = 1 / SAMPLES;
  const contentScale = 1 - inset * 2;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let bgCoverage = 0;
      let glyphSamples = 0;
      let gradient = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        const y = (py + (sy + 0.5) * sampleStep) / size;
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = (px + (sx + 0.5) * sampleStep) / size;

          if (bleed || inRoundedRect(x, y, radius)) bgCoverage += 1;
          gradient += y;

          const gx = (x - inset) / contentScale;
          const gy = (y - inset) / contentScale;
          if (gx >= 0 && gx <= 1 && gy >= 0 && gy <= 1 && glyphCoverage(gx, gy)) {
            glyphSamples += 1;
          }
        }
      }

      const total = SAMPLES * SAMPLES;
      const bgAlpha = bgCoverage / total;
      const glyphAlpha = (glyphSamples / total) * bgAlpha;
      const t = gradient / total;

      const offset = (py * size + px) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const base = top[channel] + (bottom[channel] - top[channel]) * t;
        pixels[offset + channel] = Math.round(base * (1 - glyphAlpha) + 255 * glyphAlpha);
      }
      pixels[offset + 3] = Math.round(bgAlpha * 255);
    }
  }

  return encodePng(size, pixels);
}

/* ----------------------------------------------------------------- run --- */

const ICONS = [
  // Standard icons: rounded tile, glyph filling most of the canvas.
  { file: 'icon-192.png', size: 192, bleed: false, radius: 0.22, inset: 0.16 },
  { file: 'icon-512.png', size: 512, bleed: false, radius: 0.22, inset: 0.16 },
  // Maskable icon: full-bleed background, glyph inside the 80% safe zone.
  { file: 'maskable-512.png', size: 512, bleed: true, radius: 0, inset: 0.24 },
  // iOS home-screen icon (opaque, as Apple does not honour transparency well).
  { file: 'apple-touch-icon.png', size: 180, bleed: true, radius: 0, inset: 0.18 },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const { file, ...options } of ICONS) {
  const png = renderIcon(options.size, options);
  writeFileSync(resolve(OUT_DIR, file), png);
  console.log(`wrote ${file} (${options.size}x${options.size}, ${png.length} bytes)`);
}
