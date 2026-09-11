/* Corrections form config (GitHub Pages — no secrets in this file).
 *
 * Pick ONE of the options below. The browser only ever sees a public
 * form endpoint or Web3Forms access key — never a GitHub PAT.
 *
 * Option A (recommended): Formspree — https://formspree.io
 *   1. Create a form, copy the endpoint: https://formspree.io/f/xxxxxxxx
 *   2. Paste it into formEndpoint below.
 *
 * Option B: Getform — https://getform.io
 *   Paste https://getform.io/f/xxxxxxxx into formEndpoint.
 *
 * Option C: Web3Forms — https://web3forms.com
 *   Paste your public access key into web3formsKey (leave formEndpoint "").
 *
 * Option D: FormSubmit — https://formsubmit.co
 *   Set ownerEmail to the inbox that should receive corrections.
 *   (First submission sends a confirmation link to that address.)
 *
 * Option E: Own proxy (Cloudflare Worker / similar) that holds a repo
 *   secret and writes GitHub Issues or JSON. Paste the worker URL into
 *   formEndpoint. See proxy-worker.js in this folder.
 */
window.CORRECTIONS_CONFIG = {
  formEndpoint: "",
  web3formsKey: "",
  ownerEmail: ""
};
