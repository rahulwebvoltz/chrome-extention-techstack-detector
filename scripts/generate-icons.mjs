// Generates the extension icons (public/icons/icon{16,32,48,128}.png)
// with zero dependencies: rasterizes a rounded-square + magnifier shape and
// encodes it as PNG by hand. Run: npm run icons
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { deflateSync } from "node:zlib";

const SIZES = [16, 32, 48, 128];
const OUT_DIR = resolve(import.meta.dirname, "../public/icons");
const SAMPLES = 4; // 4x4 supersampling for anti-aliasing

const TOP = [99, 102, 241]; // indigo-500
const BOTTOM = [67, 56, 202]; // indigo-700

// Shape in unit coordinates (0..1). Returns "bg" | "fg" | null.
function shapeAt(x, y) {
  const r = 0.22;
  const cx = Math.min(Math.max(x, r), 1 - r);
  const cy = Math.min(Math.max(y, r), 1 - r);
  if (Math.hypot(x - cx, y - cy) > r) return null; // outside rounded square

  // Magnifier ring
  const d = Math.hypot(x - 0.44, y - 0.44);
  if (d <= 0.24 && d >= 0.145) return "fg";

  // Magnifier handle: segment with round caps
  const [ax, ay, bx, by] = [0.6, 0.6, 0.76, 0.76];
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
  if (Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) <= 0.055) return "fg";

  return "bg";
}

function render(size) {
  const pixels = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const x = (px + (sx + 0.5) / SAMPLES) / size;
          const y = (py + (sy + 0.5) / SAMPLES) / size;
          const hit = shapeAt(x, y);
          if (!hit) continue;
          const c = hit === "fg" ? [255, 255, 255] : TOP.map((v, i) => v + (BOTTOM[i] - v) * y);
          r += c[0]; g += c[1]; b += c[2]; a += 1;
        }
      }
      const i = (py * size + px) * 4;
      if (a) {
        pixels[i] = Math.round(r / a);
        pixels[i + 1] = Math.round(g / a);
        pixels[i + 2] = Math.round(b / a);
        pixels[i + 3] = Math.round((a / SAMPLES ** 2) * 255);
      }
    }
  }
  return pixels;
}

// ---------- minimal PNG encoder ----------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  writeFileSync(resolve(OUT_DIR, `icon${size}.png`), encodePng(size, render(size)));
  console.log(`icons/icon${size}.png`);
}
