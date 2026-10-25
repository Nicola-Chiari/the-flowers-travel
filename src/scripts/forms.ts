// Invio dei moduli (contatto, newsletter) senza ricaricare la pagina.
// Oggi i dati vanno a Netlify Forms; per passare a Brevo/Mailchimp basta
// cambiare `send` per il modulo interessato (data-provider sul <form>).

type Provider = (form: HTMLFormElement) => Promise<void>;

const netlify: Provider = async (form) => {
  const body = new URLSearchParams();
  new FormData(form).forEach((value, key) => body.append(key, String(value)));
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
};

const providers: Record<string, Provider> = { netlify };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Collega un modulo. Messaggi e stati arrivano dagli attributi data-*:
 * data-error-email, data-error-consent, data-error-send, data-sending.
 */
export function enhanceForm(form: HTMLFormElement, onSuccess: () => void) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const send = providers[form.dataset.provider ?? 'netlify'] ?? netlify;
  form.noValidate = true;

  const showError = (msg: string, field?: HTMLElement | null) => {
    if (status) {
      status.textContent = msg;
      status.hidden = false;
    }
    field?.setAttribute('aria-invalid', 'true');
    field?.focus();
  };

  form.addEventListener('input', (e) => (e.target as HTMLElement).removeAttribute('aria-invalid'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) status.hidden = true;

    const email = form.querySelector<HTMLInputElement>('input[type="email"]');
    if (email && !EMAIL.test(email.value.trim())) return showError(form.dataset.errorEmail ?? '', email);
    const consent = form.querySelector<HTMLInputElement>('input[name="privacy"]');
    if (consent && !consent.checked) return showError(form.dataset.errorConsent ?? '', consent);

    const label = submit?.textContent ?? '';
    if (submit) {
      submit.disabled = true;
      submit.textContent = form.dataset.sending ?? label;
    }
    try {
      await send(form);
      form.reset();
      onSuccess();
    } catch (err) {
      console.warn(err);
      showError(form.dataset.errorSend ?? '');
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = label;
      }
    }
  });
}
