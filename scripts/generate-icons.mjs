#!/usr/bin/env node
/**
 * Generates the PNG app icons referenced by src/app/manifest.ts into public/.
 *
 * Two variants are produced per size:
 * - `icon-<size>.png` — purpose "any": the launcher displays it as-is.
 * - `icon-maskable-<size>.png` — purpose "maskable": launchers crop it to an
 *   arbitrary shape, so the glyph must stay inside the safe zone (the centred
 *   circle with a diameter of 80% of the canvas).
 *
 * All icons are full-bleed and opaque: transparent padding would show as
 * letterboxing once a launcher applies its own mask.
 *
 * Run: node scripts/generate-icons.mjs
 */

import { join, resolve } from 'path';
import sharp from 'sharp';

const ROOT = resolve(process.cwd());
const BACKGROUND = '#111827';
const FOREGROUND = '#f9fafb';
const SIZES = [192, 512];

/**
 * Builds a full-bleed SVG with the brand glyph centred.
 *
 * @param {number} size canvas size in pixels
 * @param {number} glyphRatio glyph height as a fraction of the canvas
 */
function iconSvg(size, glyphRatio) {
  const fontSize = Math.round(size * glyphRatio);
  const baseline = Math.round(size / 2 + fontSize * 0.36);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BACKGROUND}"/>
  <text x="${size / 2}" y="${baseline}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" fill="${FOREGROUND}" text-anchor="middle" font-weight="bold">ij</text>
</svg>`;
}

for (const size of SIZES) {
  const variants = [
    { file: `icon-${size}.png`, glyphRatio: 0.47 },
    { file: `icon-maskable-${size}.png`, glyphRatio: 0.4 },
  ];

  for (const { file, glyphRatio } of variants) {
    await sharp(Buffer.from(iconSvg(size, glyphRatio)))
      .png({ compressionLevel: 9 })
      .toFile(join(ROOT, 'public', file));
    console.log(`Wrote public/${file}`);
  }
}
