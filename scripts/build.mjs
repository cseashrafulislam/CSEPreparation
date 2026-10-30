// Dependency-free Cloudflare Pages build: generate installable PNG icons.
// Uses only Node.js built-in modules. No npm install, R2, D1 or network.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const iconsDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(iconsDir, { recursive: true });

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const value of buffer) {
    crc ^= value;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  const check = Buffer.alloc(4);
  check.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, check]);
}

function insideRoundedRect(x, y, min, max, radius) {
  if (x < min || x > max || y < min || y > max) return false;
  const cx = x < min + radius ? min + radius : x > max - radius ? max - radius : x;
  const cy = y < min + radius ? min + radius : y > max - radius ? max - radius : y;
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

function iconPng(size) {
  const pixels = Buffer.alloc(size * (1 + 4 * size));
  for (let y = 0; y < size; y++) {
    const offset = y * (1 + 4 * size);
    pixels[offset] = 0; // PNG filter: None
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) * 512 / size;
      const py = (y + 0.5) * 512 / size;
      const index = offset + 1 + x * 4;
      let color = [0, 0, 0, 0];
      if (insideRoundedRect(px, py, 0, 512, 118)) color = [23, 40, 61, 255];
      if (insideRoundedRect(px, py, 50, 462, 89)) color = [44, 95, 233, 255];
      const distance = Math.hypot(px - 250, py - 259);
      if (distance >= 88 && distance <= 120 && !(px > 270 && py > 193 && py < 330)) color = [255, 255, 255, 255];
      if (Math.hypot(px - 354, py - 356) <= 28) color = [161, 232, 221, 255];
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = color[3];
    }
  }
  const info = Buffer.alloc(13);
  info.writeUInt32BE(size, 0);
  info.writeUInt32BE(size, 4);
  info[8] = 8; // bits
  info[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", info),
    chunk("IDAT", deflateSync(pixels, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
  return png;
}

for (const size of [192, 512]) {
  const file = fileURLToPath(new URL(`../public/icons/icon-${size}.png`, import.meta.url));
  writeFileSync(file, iconPng(size));
  process.stdout.write(`Generated PWA icon: ${size}x${size}\n`);
}
