# Private family photo album

**Share with family (preferred once Cloudflare is current):**  
https://willwinn.xyz/other-photos/

**Always works (GitHub Pages):**  
https://papiwinn.github.io/willwinn/other-photos/

This page is **not** linked from home, letters, manuscript, or public nav. Family gets the URL from the owner.

## Hosting note

- **willwinn.xyz** is a Cloudflare Worker () with static assets at the **site root** (not ).
- **papiwinn.github.io/willwinn/** is GitHub Pages from the same  branch (path prefix ).
- Large photo trees (, ) are listed in repo-root  so Worker deploys stay under Cloudflare’s free size limit. The album loads those JPGs from jsDelivr ().

If  404s, Cloudflare Workers Builds is failing or stale — check the **Workers Builds: willwinn** check on GitHub, then Retry deployment in the Cloudflare dashboard. Until then, share the github.io URL.

## Auth

Same reviewer session as corrections / stories / photos:

-  key 
- cookies , , 
- loads 

## Files

| Path | Role |
|------|------|
|  | Gallery + notes UI |
|  | Photo list (id, file, title) |
|  | JPG files (CDN on xyz; also on GitHub Pages) |
|  | All family notes (array); Worker appends |
|  | Standalone Worker recipe (also merged into  at ) |

## Notes persistence (required)

FormSubmit cannot show notes on the page. Notes need the Cloudflare Worker:

1. Re-paste **** into Worker **icy-dust-9cb5** (includes  route).
2. Same secret:  (Contents Read/Write on ).
3. In  set:
   - : 
   - (optional) leave  as the Worker root URL

Until step 1–3, the album still shows photos, but saving notes will fail.

## Adding photos

Add JPG files under  (they stay on GitHub; Worker deploy ignores that folder), then append an entry to :



uid=1000(box) gid=1000(box) groups=1000(box) should match the filename stem (no extension) so notes stay tied to the picture.
