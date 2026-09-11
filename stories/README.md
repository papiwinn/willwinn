# Add to the Story

Reader-facing form: [`index.html`](./index.html)  
Live: https://papiwinn.github.io/willwinn/stories/

Family and friends can write about people named in the letters or on **Those Who Served with Dad**.

## Auth

Same reviewer session as the corrections form (`willwinn_reviewer` in localStorage + `ww_*` cookies). One login covers both forms.

## Inbox

Loads [`../corrections/config.js`](../corrections/config.js) — same Formspree / Getform / Web3Forms / FormSubmit settings. No client-side GitHub PAT.

Current Formspree endpoint (if set there): `formEndpoint` in that file.

## Return-to-source

“Add to the Story” buttons pass `?from=<path>` (e.g. `/willwinn/letters/people.html`). After the thank-you message, the page offers **Return** and redirects back to that path (same-origin paths only).

## Active inbox

Uses FormSubmit via `ownerEmail` in [`../corrections/config.js`](../corrections/config.js) (`papiwinn@gmail.com`). First site submission to that address requires clicking FormSubmit’s confirmation link in Gmail once.

Related: [Add a Photo](../photos/) (same auth/inbox; files emailed then filed under `letters/images/`).
