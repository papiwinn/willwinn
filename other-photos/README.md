# Private family photo album

**Share with family (preferred once Cloudflare is current):**  
https://willwinn.xyz/other-photos/

**Always works (GitHub Pages):**  
https://papiwinn.github.io/willwinn/other-photos/

This page is **not** linked from home, letters, manuscript, or public nav. Family gets the URL from the owner.

## Hosting note

- **willwinn.xyz** is a Cloudflare Worker (`willwinn`) with static assets at the **site root** (not under `/willwinn/`).
- **papiwinn.github.io/willwinn/** is GitHub Pages from the same `main` branch (URL path prefix `/willwinn/`).
- Large photo trees (`other-photos/images/`, `manuscript/images/scans-cleaned/`) are listed in repo-root `.assetsignore` so Worker deploys stay under Cloudflare’s free size limit. The album loads those JPGs from jsDelivr (`cdn.jsdelivr.net/gh/papiwinn/willwinn@main/...`).

If https://willwinn.xyz/other-photos/ returns 404, Cloudflare Workers Builds is failing or stale — check the **Workers Builds: willwinn** check on the latest GitHub commit, then use Retry deployment in the Cloudflare dashboard. Until then, share the github.io URL above.

## Auth

Same reviewer session as corrections / stories / photos:

- `localStorage` key `willwinn_reviewer`
- cookies `ww_uid`, `ww_name`, `ww_email`
- loads `../corrections/config.js`

## Files

| Path | Role |
|------|------|
| `index.html` | Gallery + notes UI (paginated, 50 photos per page) |
| `catalog.json` | Photo list (id, file, title) |
| `images/` | JPG files (CDN on xyz; also on GitHub Pages) |
| `notes.json` | All family notes (array); Worker appends |
| `notes-worker.js` | Standalone Worker recipe (also in `photos/upload-worker.js` at `/notes`) |

## Notes persistence (required)

FormSubmit cannot show notes on the page. Notes need the Cloudflare Worker:

1. Re-paste **`photos/upload-worker.js`** into Worker **icy-dust-9cb5** (includes `/notes` route).
2. Same secret: `GITHUB_TOKEN` (Contents Read/Write on `papiwinn/willwinn`).
3. In `corrections/config.js` set:
   - `albumNotesEndpoint`: `https://icy-dust-9cb5.papiwinn.workers.dev/notes`

Until that redeploy, the album can show photos, but saving notes will fail.


## Pagination

The gallery shows **50 photos per page**, with Previous / Next and page-number controls. Status text looks like “Showing 1–50 of N · Page X of Y”. Optional bookmarkable query: `?page=2` (default page 1). Returning from a photo detail view keeps you on the same page.

## Adding photos

Add JPG files under `images/` (they stay on GitHub; Worker deploy ignores that folder via `.assetsignore`), then append an entry to `catalog.json` with `id` matching the filename stem.
