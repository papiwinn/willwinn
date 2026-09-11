# Letter / story photos

Reader photos from [Add a Photo](../../photos/).

## Automatic path (preferred)

When `photoEndpoint` in `corrections/config.js` points at the Cloudflare Worker (`photos/upload-worker.js`), uploads are committed here on `main` as:

`yyyymmdd-person-location.jpg` (or `.png` / `.webp` / `.gif`)

Collision suffixes: `a`, `b`, `c`, … then a short uid.  
A log line is appended to `submissions.jsonl` (best-effort).

Link images from the manuscript, people page, or Those Who Served as you review them.

## Manual path (FormSubmit email fallback)

Until the Worker is configured, FormSubmit may email the file to `papiwinn@gmail.com` (non-AJAX only). Then:

1. Save the attachment into this folder
2. Use the same naming convention
3. Commit on `main`

Do **not** rely on FormSubmit AJAX for files — it strips attachments.
