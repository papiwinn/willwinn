/* Corrections + stories + photos + private album config (GitHub Pages — no secrets here).
 *
 * Corrections / stories (text):
 *   ownerEmail → FormSubmit email inbox (works for text fields).
 *
 * Photos (files must not use FormSubmit AJAX — it drops attachments):
 *   photoEndpoint → Cloudflare Worker URL (photos/upload-worker.js)
 *   that commits the image into letters/images/ using a server-side
 *   GITHUB_TOKEN secret.
 *
 * Private family album notes (other-photos/):
 *   albumNotesEndpoint → same Worker + "/notes"
 *   Example: "https://icy-dust-9cb5.papiwinn.workers.dev/notes"
 *   Redeploy photos/upload-worker.js to icy-dust so /notes exists.
 */
window.CORRECTIONS_CONFIG = {
  formEndpoint: "",
  web3formsKey: "",
  ownerEmail: "papiwinn@gmail.com",
  photoEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev",
  /* After redeploying upload-worker.js with /notes support: */
  albumNotesEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev/notes"
};
