// @ts-check
import { cp } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Netlify imposta URL con il dominio principale del sito; SITE_URL lo sovrascrive.
const site = process.env.SITE_URL || process.env.URL || 'https://theflowerstravel.netlify.app';

/**
 * Il CMS mostra le anteprime delle foto leggendole da /src/assets/uploads/…:
 * copiamo gli originali anche lì. Il sito usa invece le versioni ottimizzate.
 */
/** @type {import('astro').AstroIntegration} */
const cmsMediaPreview = {
  name: 'cms-media-preview',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await cp(new URL('./src/assets/uploads/', import.meta.url), new URL('./src/assets/uploads/', dir), {
        recursive: true,
      });
    },
  },
};

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !/\/(grazie|404)(\.html)?$/.test(page),
    }),
    cmsMediaPreview,
  ],
});
