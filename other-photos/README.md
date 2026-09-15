# Private family photo album

**Live URL (share privately only):** https://willwinn.xyz/willwinn/other-photos/

This page is **not** linked from home, letters, manuscript, or public nav. Family gets the URL from the owner.

## Auth

Same reviewer session as corrections / stories / photos:

- `localStorage` key `willwinn_reviewer`
- cookies `ww_uid`, `ww_name`, `ww_email`
- loads `../corrections/config.js`

## Files

| Path | Role |
|------|------|
| `index.html` | Gallery + notes UI |
| `catalog.json` | Photo list (id, file, title) |
| `images/` | JPG files (uploaded separately) |
| `notes.json` | All family notes (array); Worker appends |
| `notes-worker.js` | Standalone Worker recipe (also merged into `photos/upload-worker.js` at `/notes`) |

## Notes persistence (required)

FormSubmit cannot show notes on the page. Notes need the Cloudflare Worker:

1. Re-paste **`photos/upload-worker.js`** into Worker **icy-dust-9cb5** (includes `/notes` route).
2. Same secret: `GITHUB_TOKEN` (Contents Read/Write on `papiwinn/willwinn`).
3. In `corrections/config.js` set:
   - `albumNotesEndpoint`: `https://icy-dust-9cb5.papiwinn.workers.dev/notes`
   - (optional) leave `photoEndpoint` as the Worker root URL

Until step 1–3, the album still shows photos from `catalog.json` / `images/`, but saving notes will fail.

## Adding photos

Add JPG files under `images/`, then append an entry to `catalog.json`:

```json
{ "id": "MyPhoto", "file": "MyPhoto.jpg", "title": "My Photo" }
```

`id` should match the filename stem (no extension) so notes stay tied to the picture.
