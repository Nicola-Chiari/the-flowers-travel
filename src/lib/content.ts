import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

type SingleKey = Exclude<CollectionKey, 'viaggi' | 'articoli' | 'pagine'>;

/** Contenuto di una sezione salvata come file unico (es. home/hero.json). */
export async function single<K extends SingleKey>(name: K): Promise<CollectionEntry<K>['data']> {
  const [entry] = await getCollection(name);
  if (!entry) throw new Error(`Manca il file di contenuto della sezione "${name}".`);
  return entry.data;
}

/** Viaggi pubblicati, in ordine. Fallisce se un viaggio usa una categoria inesistente. */
export async function getViaggi() {
  const { categories } = await single('viaggiIntro');
  const names = new Set(categories.map((c) => c.name));
  const all = await getCollection('viaggi');
  for (const v of all) {
    if (!names.has(v.data.category)) {
      throw new Error(
        `Il viaggio "${v.data.title}" usa la categoria "${v.data.category}", che non esiste in "Categorie (filtri)".`,
      );
    }
  }
  return all
    .filter((v) => v.data.published)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'it'));
}

export async function getArticoli() {
  return (await getCollection('articoli'))
    .filter((a) => a.data.published)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Divide un testo su un marcatore come [[foto]]; null se il marcatore manca. */
export function splitMarker(text: string, marker: string): [string, string] | null {
  const i = text.indexOf(marker);
  if (i === -1) return null;
  return [text.slice(0, i), text.slice(i + marker.length)];
}

export const stripMarkers = (text: string) => text.replace(/\[\[\/?foto\]\]/g, '');

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
