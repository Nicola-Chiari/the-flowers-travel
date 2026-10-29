import { getArticoli, getViaggi, single } from './content';

/** Sezioni della home che hanno contenuto da mostrare (per nav, footer e pagina). */
export async function getVisibleSections() {
  const [viaggi, articoli, consigli, recensioni, destinazioni] = await Promise.all([
    getViaggi(),
    getArticoli(),
    single('consigli'),
    single('recensioni'),
    single('destinazioni'),
  ]);
  const hidden = new Set<string>();
  if (viaggi.length === 0) hidden.add('viaggi');
  if (!consigli.show || articoli.length === 0) hidden.add('consigli');
  if (recensioni.items.length === 0) hidden.add('recensioni');
  if (destinazioni.items.length === 0) hidden.add('destinazioni');
  return { isVisible: (id: string) => !hidden.has(id) };
}
