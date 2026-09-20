/* Corrections + stories + photos + private album + genealogy config (no secrets here).
 *
 * Corrections / stories / genealogy text (comments + vitals notify):
 *   ownerEmail → FormSubmit email inbox.
 *
 * Photos (files must not use FormSubmit AJAX — it drops attachments):
 *   photoEndpoint → Cloudflare Worker (photos/upload-worker.js)
 *
 * Genealogy portraits (pending only — William approves before live):
 *   genealogyPortraitEndpoint → same Worker + "/genealogy-portrait"
 *   Writes genealogy/images/pending/ … redeploy icy-dust after Worker changes.
 *
 * Genealogy vitals staging (optional; FormSubmit is the notify path):
 *   genealogyVitalsEndpoint → same Worker + "/genealogy-vitals"
 *
 * Private family album notes (other-photos/):
 *   albumNotesEndpoint → same Worker + "/notes"
 */
window.CORRECTIONS_CONFIG = {
  formEndpoint: "",
  web3formsKey: "",
  ownerEmail: "papiwinn@gmail.com",
  photoEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev",
  albumNotesEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev/notes",
  genealogyPortraitEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev/genealogy-portrait",
  genealogyVitalsEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev/genealogy-vitals"
};
