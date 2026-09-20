# Private family genealogy

**Share with family:**
- https://willwinn.xyz/genealogy/
- Backup: https://papiwinn.github.io/willwinn/genealogy/

Unlisted — **no** links from Home, letters, manuscript, nav, or footer (same pattern as `other-photos/`).

## Layout (hybrid)

1. `index.html` — hub with Lovy household diagram, featured people, documents/photos strip
2. `people/*.html` — person pages (photo placeholder, relation, narrative, timeline, Sources)
3. `data/people.json` — machine-readable card data (optional maintenance aid)

## FACT vs need-more

Person pages tag items:
- **FACT** — family-locked structure or cited claim
- **need-more** — waiting on Crystal (or another researcher) for a citation

## Add a person

1. Add an entry to `data/people.json`
2. Copy an existing `people/*.html` template (or regenerate from the JSON helper)
3. Add a featured card on `index.html` if they belong on the hub
4. Keep Sources ready for Crystal’s links (census, vital, Find a Grave, newspapers)

## Do not

- Link this section from the public site chrome
- Invent relationships; leave Josie Belle Sides (and others) as need-more until proven

## Corrections / comments

Each person page (and the hub) has a floating **✎** button. Reviewers sign in with the same name + email session as letters corrections (`willwinn_reviewer` / `ww_*` cookies) and submit a free-text note plus optional “where on this page.”

Submissions go through `corrections/config.js` (FormSubmit to `ownerEmail`, or `formEndpoint` / Web3Forms if set). William receives email and edits pages himself — public submits never rewrite HTML. Pending notes are not shown on the page.

## Portraits

Person portraits live in `images/` as `{person-slug}.jpg` and are shown on the matching `people/{slug}.html` page. Source files arrive via William’s Google Sheet (Drive links); Amos compresses for web before commit.

## Family contributions (✎ button)

On the hub and every person page, signed-in reviewers can:

1. **Comment / correction** — FormSubmit email to `papiwinn@gmail.com` (same as letters)
2. **Portrait upload** — file goes to `images/pending/` via icy-dust `/genealogy-portrait` (never auto-replaces live `images/{slug}.jpg`)
3. **Vitals** — DOB/DOD/places/marriage fields emailed as **PENDING** (not FACT); optional Worker staging in `pending/vitals.json`

William reviews email (and pending paths), then promotes approved portraits/vitals by hand or asks Amos. Redeploy icy-dust after updating `photos/upload-worker.js` so portrait/vitals Worker routes exist.

