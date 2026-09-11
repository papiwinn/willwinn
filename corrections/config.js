/* Corrections + stories form config (GitHub Pages — no secrets in this file).
 *
 * Active setup: FormSubmit → ownerEmail below.
 * Leave formEndpoint and web3formsKey empty so FormSubmit is used.
 *
 * First submission to a new ownerEmail sends a confirmation link to that
 * address — open the email and click Activate once. After that, corrections
 * and “Add to the Story” both arrive as email (and in FormSubmit’s log if
 * you create an account).
 *
 * Other options (only one path should be filled):
 *   formEndpoint  — Formspree / Getform / Worker URL
 *   web3formsKey  — Web3Forms public access key
 *   ownerEmail    — FormSubmit (https://formsubmit.co)
 */
window.CORRECTIONS_CONFIG = {
  formEndpoint: "",
  web3formsKey: "",
  ownerEmail: "papiwinn@gmail.com"
};
