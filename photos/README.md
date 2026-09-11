# Add a Photo

Form: [`index.html`](./index.html)  
Live: https://willwinn.xyz/willwinn/photos/

## Auth / return

Same reviewer session (`willwinn_reviewer` + `ww_*` cookies) and [`../corrections/config.js`](../corrections/config.js) as corrections and stories.  
`?from=` return works the same way; thank-you stays on this site (no GitHub hand-off).

Fields: **person name**, **date**, **location**, **file upload** (image, max 5 MB).

## How uploads stick (preferred)

FormSubmit **AJAX drops attachments**. Photos need a real file path:

1. Deploy [`upload-worker.js`](./upload-worker.js) as a **Cloudflare Worker**
2. Worker secret **`GITHUB_TOKEN`**: fine-grained PAT with **Contents: Read and write** on `papiwinn/willwinn` only (no client-side PAT)
3. Optional Worker vars: `GITHUB_REPO=papiwinn/willwinn`, `IMAGES_PATH=letters/images`
4. Paste the Worker URL into `corrections/config.js` → **`photoEndpoint`**
5. Commit/push that config change

Then each submit POSTs multipart to the Worker, which commits the image into [`../letters/images/`](../letters/images/) on `main` (filename like `yyyymmdd-person-location.jpg`, with `a`/`b`/`c` on collision) and appends a line to `letters/images/submissions.jsonl`.

## Fallback (until Worker is live)

If `photoEndpoint` is empty but `ownerEmail` is set, the form does a **classic** (non-AJAX) FormSubmit POST so the file can attach to email. That does **not** write into the repo; you still save the attachment into `letters/images/` by hand.

## Owner checklist

| Step | Where |
|------|--------|
| Deploy Worker | Cloudflare → Workers → paste `upload-worker.js` |
| Secret | `GITHUB_TOKEN` (Contents R/W on this repo) |
| Config | `corrections/config.js` → `photoEndpoint` = Worker URL |
