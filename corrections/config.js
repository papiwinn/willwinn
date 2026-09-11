/* Corrections + stories + photos config (GitHub Pages — no secrets here).
 *
 * Corrections / stories (text):
 *   ownerEmail → FormSubmit email inbox (works for text fields).
 *
 * Photos (files must not use FormSubmit AJAX — it drops attachments):
 *   photoEndpoint → Cloudflare Worker URL (photos/upload-worker.js)
 *   that commits the image into letters/images/ using a server-side
 *   GITHUB_TOKEN secret.
 *
 * Until photoEndpoint is set, the photo form falls back to a non-AJAX
 * FormSubmit POST (files can attach to email) but will NOT write into
 * the repo automatically.
 */
window.CORRECTIONS_CONFIG = {
  formEndpoint: "",
  web3formsKey: "",
  ownerEmail: "papiwinn@gmail.com",
  photoEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev"
};
