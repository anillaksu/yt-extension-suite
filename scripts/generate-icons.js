import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const ICONS_DIR = path.resolve('extension', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Function to generate a simple RGBA PNG buffer with an icon gradient and lightning bolt
function createPng(width, height) {
  // Create RGBA raw image data
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded icon background
      if (dist <= 0.9) {
        // Gradient from Indigo/Blue to Purple/Pink
        const r = Math.floor(59 + (236 - 59) * (x / width));
        const g = Math.floor(130 + (72 - 130) * (y / height));
        const b = Math.floor(246 + (153 - 246) * (x / width));
        
        // Lightning bolt shape approximation in center
        const nx = x / width;
        const ny = y / height;
        const inBolt = (ny >= 0.25 && ny <= 0.55 && nx >= (0.6 - ny * 0.4) && nx <= (0.75 - ny * 0.3)) ||
                       (ny >= 0.45 && ny <= 0.75 && nx >= (0.55 - (ny - 0.45) * 0.4) && nx <= (0.7 - (ny - 0.45) * 0.3));

        if (inBolt) {
          rawData[pixelOffset] = 255;     // R
          rawData[pixelOffset + 1] = 255; // G
          rawData[pixelOffset + 2] = 255; // B
          rawData[pixelOffset + 3] = 255; // Alpha
        } else {
          rawData[pixelOffset] = r;
          rawData[pixelOffset + 1] = g;
          rawData[pixelOffset + 2] = b;
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        // Transparent
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // Calculate CRC32
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// Simple CRC32 table & implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Generate 16, 48, 128
[16, 48, 128].forEach(size => {
  const png = createPng(size, size);
  fs.writeFileSync(path.join(ICONS_DIR, `icon${size}.png`), png);
  console.log(`✅ Generated icon${size}.png`);
});
