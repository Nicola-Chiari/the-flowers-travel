// Schemi dei contenuti. Rispecchiano public/admin/config.yml: se aggiungi un
// campo nel CMS, aggiungilo anche qui (e viceversa), altrimenti la build si ferma
// con un errore che indica file e campo.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const MEDIA_PREFIX = '/src/assets/uploads/';
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;
const VIDEO_EXT = /\.(mp4|webm)$/i;

const fileExists = (p: string) => existsSync(join(process.cwd(), p));

/** Percorso di un file caricato dal CMS. Vuoto = nessun file. */
function media(kind: 'image' | 'video', required: boolean) {
  const ext = kind === 'image' ? IMAGE_EXT : VIDEO_EXT;
  const formats = kind === 'image' ? 'JPG, PNG, WebP, AVIF o GIF' : 'MP4 o WebM';
  const base = z
    .string()
    .nullish()
    .transform((v) => (v ?? '').trim())
    .refine((v) => !required || v !== '', { message: 'File obbligatorio: caricalo dal CMS.' })
    .refine((v) => v === '' || /^https?:\/\//.test(v) || v.startsWith(MEDIA_PREFIX), {
      message: `Il file deve stare nella libreria media (${MEDIA_PREFIX}).`,
    })
    .refine((v) => v === '' || /^https?:\/\//.test(v) || ext.test(v), {
      message: `Formato non supportato: usa ${formats} (le foto HEIC dell'iPhone vanno prima convertite in JPG).`,
    })
    .refine((v) => v === '' || /^https?:\/\//.test(v) || fileExists(v), {
      message: 'Il file indicato non esiste nella libreria media.',
    });
  return base;
}
const image = (required = false) => media('image', required);
const video = (required = false) => media('video', required);

const text = z.string().trim().min(1, 'Campo obbligatorio.');
const optionalText = z
  .string()
  .nullish()
  .transform((v) => (v ?? '').trim());
const optionalList = <T extends z.ZodType>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform((v) => v ?? []);

const single = (base: string, file: string) => glob({ base, pattern: file });

/* ---------- Impostazioni ---------- */

const site = defineCollection({
  loader: single('./src/content/settings', 'site.json'),
  schema: z.object({
    phone: text,
    phoneLink: z.string().regex(/^\+?[0-9]{6,15}$/, 'Solo cifre, con prefisso (es. +393389358824).'),
    email: z.email('Email non valida.'),
    whatsappNumber: z.string().regex(/^[0-9]{8,15}$/, 'Solo cifre, con prefisso internazionale, senza +.'),
    whatsappMessage: text,
    vat: optionalText,
    logoNav: image(true),
    logoFooter: image(true),
    divider: image(),
    socials: z.object({
      instagram: optionalText,
      facebook: optionalText,
      tiktok: optionalText,
      pinterest: optionalText,
    }),
    footerTagline: text,
    footerRight: text,
    newsletterText: text,
    newsletterThanks: text,
    seo: z.object({
      title: text,
      description: text.max(200, 'Massimo 200 caratteri (meglio 160).'),
      image: image(),
    }),
  }),
});

const link = z.object({ label: text, target: text });

const ui = defineCollection({
  loader: single('./src/content/settings', 'ui.json'),
  schema: z.object({
    nav: z.array(link).min(1),
    navMenuOpen: text,
    navMenuClose: text,
    heroScroll: text,
    carouselPrev: text,
    carouselNext: text,
    close: text,
    whatsapp: text,
    starsLabel: text,
    form: z.object({
      nameLabel: text,
      namePlaceholder: optionalText,
      emailLabel: text,
      emailPlaceholder: optionalText,
      phoneLabel: text,
      phonePlaceholder: optionalText,
      consentBefore: optionalText,
      consentLink: text,
      consentAfter: optionalText,
      sending: text,
      errorEmail: text,
      errorConsent: text,
      errorSend: text,
      emailSubject: text,
    }),
    channels: z.object({ phone: text, email: text }),
    newsletter: z.object({
      placeholder: text,
      button: text,
      consentBefore: optionalText,
      consentLink: text,
      consentAfter: optionalText,
      errorSend: text,
    }),
    footer: z.object({
      menuTitle: text,
      linksTitle: text,
      socialTitle: text,
      menu: z.array(
        link.extend({
          emphasis: z.boolean().nullish().transform((v) => v ?? false),
          indent: z.boolean().nullish().transform((v) => v ?? false),
        }),
      ),
      privacy: text,
      cookie: text,
      copyright: text,
      vatPrefix: text,
    }),
    pages: z.object({
      updated: text,
      backHome: text,
      thanksTitle: text,
      thanksText: text,
      notFoundTitle: text,
      notFoundText: text,
      storyBack: text,
      articleBack: text,
    }),
  }),
});

/* ---------- Home ---------- */

const home = (file: string) => single('./src/content/home', file);

const hero = defineCollection({
  loader: home('hero.json'),
  schema: z.object({
    video: video(),
    videoWebm: video(),
    poster: image(),
    logo: image(true),
    signature: text,
    titleLine1: text,
    titleLine2: optionalText,
    subtitle: text,
    ctaPrimary: text,
    ctaSecondary: text,
  }),
});

const chiSono = defineCollection({
  loader: home('chi-sono.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    photo: image(true),
    photoAlt: text,
    paragraphs: z.array(text).min(1),
    whyTitle: text,
    whyItems: optionalList(text),
    valuesTitle: text,
    valuesItems: optionalList(text),
  }),
});

const servizi = defineCollection({
  loader: home('servizi.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    intro: optionalText,
    items: z.array(z.object({ title: text, desc: text, icon: image() })),
    cta: text,
  }),
});

const comeFunziona = defineCollection({
  loader: home('come-funziona.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    steps: z.array(z.object({ title: text, desc: text, image: image() })),
  }),
});

const viaggiIntro = defineCollection({
  loader: home('viaggi.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    allLabel: text,
    categories: z.array(z.object({ name: text })).min(1),
    modalCta: text,
  }),
});

const feature = z.object({
  eyebrow: text,
  title: text,
  text: text,
  image: image(),
  imageAlt: optionalText,
  cta: text,
});
const nozze = defineCollection({ loader: home('nozze.json'), schema: feature });
const famiglia = defineCollection({ loader: home('famiglia.json'), schema: feature });

const consigli = defineCollection({
  loader: home('consigli.json'),
  schema: z.object({ show: z.boolean(), eyebrow: text, title: text }),
});

const recensioni = defineCollection({
  loader: home('recensioni.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    items: optionalList(
      z.object({ quote: text, name: text, trip: optionalText, stars: z.number().int().min(1).max(5) }),
    ),
  }),
});

const contatti = defineCollection({
  loader: home('contatti.json'),
  schema: z.object({
    eyebrow: text,
    title: text,
    text: text,
    openButton: text,
    questions: optionalList(z.object({ label: text, placeholder: optionalText })),
    submitButton: text,
    successMessage: text,
    otherChannels: text,
  }),
});

/* ---------- Collezioni ---------- */

const viaggi = defineCollection({
  loader: glob({ base: './src/content/viaggi', pattern: '*.md' }),
  schema: z.object({
    title: text,
    destination: text,
    duration: optionalText,
    category: text,
    cover: image(),
    coverAlt: optionalText,
    gallery: optionalList(z.object({ image: image(true), alt: optionalText })),
    stamp: z
      .object({
        country: optionalText,
        mark: optionalText,
        value: optionalText,
        year: z.union([z.string(), z.number()]).nullish(),
      })
      .nullish()
      .transform((s) => ({
        country: s?.country || 'Italia',
        mark: s?.mark || 'TFT',
        value: s?.value || '€ 1,20',
        year: String(s?.year || new Date().getFullYear()),
      })),
    order: z.number().int().nullish().transform((v) => v ?? 10),
    published: z.boolean().nullish().transform((v) => v ?? true),
  }),
});

const articoli = defineCollection({
  loader: glob({ base: './src/content/articoli', pattern: '*.md' }),
  schema: z.object({
    title: text,
    category: text,
    date: z.coerce.date(),
    cover: image(),
    coverAlt: optionalText,
    excerpt: optionalText,
    published: z.boolean().nullish().transform((v) => v ?? true),
  }),
});

const pagine = defineCollection({
  loader: glob({ base: './src/content/pagine', pattern: '*.md' }),
  schema: z.object({ title: text, updated: z.coerce.date().nullish() }),
});

export const collections = {
  site,
  ui,
  hero,
  chiSono,
  servizi,
  comeFunziona,
  viaggiIntro,
  nozze,
  famiglia,
  consigli,
  recensioni,
  contatti,
  viaggi,
  articoli,
  pagine,
};
