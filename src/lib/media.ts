// Collega i percorsi scritti dal CMS ("/src/assets/uploads/foto.jpg") ai file
// reali, così Astro può ottimizzare le immagini (WebP/AVIF ridimensionate).
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{png,jpg,jpeg,webp,avif,gif,PNG,JPG,JPEG,WEBP,AVIF,GIF}',
  { eager: true },
);
const files = import.meta.glob<string>('/src/assets/uploads/**/*.{mp4,webm,MP4,WEBM}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const isRemote = (p: string) => /^https?:\/\//.test(p);

/** Immagine ottimizzabile, URL remoto o undefined se il campo è vuoto. */
export function resolveImage(path: string | undefined): ImageMetadata | string | undefined {
  if (!path) return undefined;
  if (isRemote(path)) return path;
  const found = images[path];
  if (!found) throw new Error(`Immagine non trovata: ${path}`);
  return found.default;
}

/** URL pubblico di un file non-immagine (video). */
export function resolveFile(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (isRemote(path)) return path;
  const found = files[path];
  if (!found) throw new Error(`File non trovato: ${path}`);
  return found;
}
