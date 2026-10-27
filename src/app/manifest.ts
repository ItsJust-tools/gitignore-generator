import type { MetadataRoute } from 'next';
import { templateMetadata } from '@/tool/template-metadata';

/**
 * Sizes for the raster PNG icons. SVGs are used for the scalable "any" icon,
 * PNGs are required by launchers that cannot rasterise SVG.
 */
const PNG_ICON_SIZES = [192, 512] as const;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: templateMetadata.appName,
    short_name: templateMetadata.shortName,
    description: templateMetadata.appDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#111827',
    icons: [
      {
        src: templateMetadata.iconPath,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      ...PNG_ICON_SIZES.map((size) => ({
        src: `/icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any' as const,
      })),
      // Maskable icons are full-bleed with the glyph inside the 80% safe zone,
      // so launchers can crop them to circles/squircles without clipping art.
      ...PNG_ICON_SIZES.map((size) => ({
        src: `/icon-maskable-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'maskable' as const,
      })),
    ],
  };
}
