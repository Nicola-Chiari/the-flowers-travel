# The Flowers Travel — sito

Sito one-page di Elena, travel designer. Astro (output statico) + Decap CMS su `/admin`, ospitato su Netlify.

Ogni testo, immagine e contatto sta in `src/content/` e si modifica dal CMS: nei componenti non ci sono testi scritti a mano.

## Comandi

```sh
npm install
npm run dev       # sito in locale su http://localhost:4321
npm run build     # build di produzione in dist/
npm run check     # controllo TypeScript
npm run cms       # backend locale del CMS (con `npm run dev` aperto, vai su /admin)
```

Node 22.

## Struttura

```
public/admin/        Decap CMS (index.html + config.yml)
src/content/         contenuti: JSON per le sezioni, Markdown per viaggi/articoli/pagine
src/content.config.ts  schemi zod: rispecchiano public/admin/config.yml
src/assets/uploads/  foto e video caricati dal CMS (ottimizzati in WebP alla build)
src/components/      una sezione = un componente
src/lib/             accesso ai contenuti, risoluzione dei media, sezioni visibili
src/scripts/forms.ts invio moduli (Netlify Forms, sostituibile)
src/styles/tokens.css  colori, font, raggi, ombre
```

### Regole

- **Un campo nuovo va aggiunto in due posti**: `public/admin/config.yml` (cosa vede Elena) e `src/content.config.ts` (cosa accetta la build). Se non coincidono la build si ferma con un errore che indica file e campo, e Netlify lascia online la versione precedente.
- **Media**: Decap salva i file in `src/assets/uploads/` e scrive nei contenuti il percorso `/src/assets/uploads/nome.jpg`. `src/lib/media.ts` lo collega al file vero, così `astro:assets` può ridimensionarlo. Gli originali vengono copiati anche in `dist/src/assets/uploads/` (integrazione in `astro.config.mjs`) solo per le anteprime nel CMS.
- **Sezioni opzionali**: Viaggi, Consigli e Recensioni spariscono (anche da menu e footer) quando non hanno contenuti pubblicati. Logica in `src/lib/sections.ts`.
- **Foto in "Chi sono"**: `[[foto]]` nel titolo e `[[/foto]]` in un paragrafo segnano il bordo alto e basso della foto. Senza marcatori la foto prende l'altezza del testo.
- I font sono self-hosted (pacchetti `@fontsource`), niente Google Fonts.

## Messa online (una volta sola)

1. **Netlify** → *Add new site → Import from Git* → questo repository. Build e cartella si leggono da `netlify.toml`.
2. **Login al CMS** (Elena entra con un account GitHub):
   - GitHub → *Settings → Developer settings → OAuth Apps → New*: Homepage `https://<dominio>`, callback `https://api.netlify.com/auth/done`.
   - Netlify → impostazioni del sito → *Access control → OAuth* (nelle versioni recenti: *Access & security → OAuth*) → *Install provider* → GitHub, con Client ID e Secret dell'app.
   - Elena deve essere **collaboratrice del repository** (GitHub → Settings → Collaborators), altrimenti può entrare ma non salvare.
3. **Moduli**: Netlify → *Forms* → abilita il rilevamento dei moduli, poi fai un nuovo deploy. Compariranno `contatto` e `newsletter`. In *Forms → Notifications* aggiungi una notifica email verso `theflowerstravel@gmail.com` per il modulo `contatto`.
4. **Avvisi build fallite**: *Project configuration → Notifications → Deploy notifications* → email se un deploy fallisce (altrimenti Elena non saprebbe che la modifica non è andata online).
5. **Dominio**: *Domain management → Add domain*. Dal registrar: record `A` del dominio nudo verso `75.2.60.5` e `CNAME` di `www` verso `<sito>.netlify.app` (oppure delega i nameserver a Netlify). HTTPS si attiva da solo; imposta il dominio principale, e `www` reindirizza lì.
6. Il sito usa la variabile `URL` di Netlify per canonical, sitemap e Open Graph: dopo aver collegato il dominio fai un nuovo deploy.

## Newsletter

Oggi le iscrizioni finiscono in Netlify Forms (da esportare a mano in CSV). Per passare a Brevo o Mailchimp aggiungi un provider in `src/scripts/forms.ts` e metti `data-provider="<nome>"` sul form in `src/components/Footer.astro`.

## Da completare prima del lancio

- [ ] Partita IVA (Impostazioni sito).
- [ ] Testo della Privacy Policy (Pagine → Privacy Policy): oggi è un segnaposto.
- [ ] Verificare il testo della pagina Cookie: vale finché non si aggiungono statistiche o pixel.
- [ ] Recensioni e viaggi: quelli attuali vengono dal prototipo. Vanno sostituiti con storie e recensioni vere (o nascosti).
- [ ] Verificare che i quattro profili social esistano davvero (un campo vuoto nasconde l'icona).
- [ ] Immagini mancanti: icone servizi, illustrazioni passi 3–4, foto Nozze e Famiglia, foto dei viaggi.
