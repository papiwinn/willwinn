# Corrections / review feedback

Reader-facing form: [`index.html`](./index.html)  
Live URL (GitHub Pages): https://papiwinn.github.io/willwinn/corrections/

## Auth (session)

Reviewers sign in with **name** and **email** before the form unlocks.

**Primary:** in-memory session for the current visit, plus `localStorage` key `willwinn_reviewer` (`{uid,name,email}`) so Continue always advances even if cookies are blocked.

**Mirror cookies** (best-effort, 180 days; Path derived from the real page URL, including `/willwinn/` when present):

| Cookie | Purpose |
|--------|---------|
| `ww_uid` | Stable reviewer id (UUID, created on first login) |
| `ww_name` | Display name |
| `ww_email` | Email |

Returning visitors with localStorage or cookies skip the login screen. **Sign out** clears memory, localStorage, and cookies.

This is lightweight identity for the family site, not password security.

## Form fields

1. Describe Mistake  
2. Where it is  
3. Corrections  

On submit the page stores: `uid`, submission date/time (ISO UTC), reviewer name/email/`ww_uid`, plus the three fields.

## Database (how to retrieve / edit)

Because the site is static **GitHub Pages**, submissions are stored as:

1. **GitHub Issues** with label `correction` — easiest day-to-day inbox  
   https://github.com/papiwinn/willwinn/issues?q=is%3Aissue+label%3Acorrection  
   Edit or close issues as you resolve them.

2. **JSON archive** in this folder: `corrections/inbox/<issue-number>.json`  
   Written automatically by `.github/workflows/archive-correction.yml` when a `correction` issue is opened. You can browse or edit those files in the repo.

Each JSON file looks like:

```json
{
  "uid": "…",
  "submitted_at": "2026-09-11T12:00:00.000Z",
  "user_id": "…",
  "name": "…",
  "email": "…",
  "mistake": "…",
  "where": "…",
  "corrections": "…",
  "issue_number": 12,
  "issue_url": "https://github.com/papiwinn/willwinn/issues/12"
}
```

## Optional: in-page submit (no GitHub hand-off)

Edit `config.js` and set `githubToken` to a fine-grained PAT with **Issues: Read and write** on this repo only. The form will then create the issue via the API and stay on the thank-you screen. Rotate the token if it ever leaks (it is visible in page source).

Without a token, submit opens GitHub’s “new issue” form already filled in; the reviewer clicks **Submit new issue** once (GitHub login required for that step only).


## Enable the archive Action (one-time)

Pushing workflow files needs the GitHub `workflow` scope. If `.github/workflows/archive-correction.yml` is not on `main` yet, copy it from this folder:

1. Create `.github/workflows/archive-correction.yml` on `main` with the contents of [`archive-correction.yml`](./archive-correction.yml)
2. Optional: add [`.github/ISSUE_TEMPLATE/correction.yml`](./issue-template-correction.yml) for manual issue filing
3. Issues with label `correction` will then write `corrections/inbox/<n>.json` automatically

Until that Action is enabled, use the Issues list alone as your database — it still works.
