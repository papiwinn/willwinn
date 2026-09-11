# Corrections / review feedback

Reader-facing form: [`index.html`](./index.html)  
Live: https://papiwinn.github.io/willwinn/corrections/

Reviewers **never leave this page** for GitHub. Submit stays here and shows the thank-you message.

## Auth (session)

Sign in with **name** and **email** before the form unlocks.

- **Primary:** in-memory session + `localStorage` key `willwinn_reviewer` (`{uid,name,email}`)
- **Mirror cookies** (best-effort, 180 days; Path derived from the real URL): `ww_uid`, `ww_name`, `ww_email`

**Sign out** clears memory, localStorage, and cookies. Lightweight identity only — not password security.

## Form fields

1. Describe Mistake  
2. Where it is  
3. Corrections  

Each submission sends: `uid`, `submitted_at` (ISO UTC), `user_id`, `name`, `email`, plus the three fields.

## Active inbox (FormSubmit)

Both **corrections** and **Add to the Story** load this `config.js`.

- `ownerEmail`: `papiwinn@gmail.com`
- `formEndpoint` and `web3formsKey` are empty so FormSubmit is used
- **First submission** sends a confirmation link to that Gmail — click it once to activate. Later submissions arrive as email.

## Connect the inbox (required — no secrets in the browser)

Edit [`config.js`](./config.js). Pick **one** option. Do **not** put a GitHub PAT in `config.js`.

### A. Formspree (recommended)

1. Sign up at https://formspree.io and create a form  
2. Copy the endpoint (`https://formspree.io/f/xxxxxxxx`)  
3. Set `formEndpoint` in `config.js`  
4. Review submissions in the Formspree dashboard (and email notifications)

### B. Getform

Same idea: paste `https://getform.io/f/xxxxxxxx` into `formEndpoint`.

### C. Web3Forms

1. Get a public access key at https://web3forms.com  
2. Set `web3formsKey` in `config.js` (leave `formEndpoint` empty)

### D. FormSubmit (email inbox)

Set `ownerEmail` to the address that should receive corrections. First submission sends a confirmation link to that inbox — click it once. Later submissions arrive as email (FormSubmit also keeps a simple log if you create an account).

### E. Own proxy → GitHub Issues (secret stays on the server)

Use when you want Issues as the editable database:

1. Deploy [`proxy-worker.js`](./proxy-worker.js) as a Cloudflare Worker (or similar)  
2. Add Worker secret `GITHUB_TOKEN` — fine-grained PAT with **Issues: Read and write** on `papiwinn/willwinn` only  
3. Paste the Worker URL into `formEndpoint`  
4. Optional: enable [`archive-correction.yml`](./archive-correction.yml) under `.github/workflows/` so each Issue also writes `corrections/inbox/<n>.json`

## Thank-you copy

After a successful submit:

> We will review your information and let you know when corrections are made.  Thank you.

## Local outbox

Successful submits are also appended to `localStorage` key `willwinn_corrections_outbox` on the reviewer’s browser (backup only — not visible to the owner).

## Shared with stories and photos

[`../stories/`](../stories/) and [`../photos/`](../photos/) load this same `config.js`.

- **Corrections / stories (text):** `ownerEmail` / `formEndpoint` / `web3formsKey` as above.
- **Photos (files):** set **`photoEndpoint`** to the Cloudflare Worker URL from [`../photos/upload-worker.js`](../photos/upload-worker.js). That Worker holds `GITHUB_TOKEN` and commits into `letters/images/`. Do **not** use FormSubmit AJAX for photo files (attachments are dropped). See [`../photos/README.md`](../photos/README.md).
