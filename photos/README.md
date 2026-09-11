# Add a Photo

Form: [`index.html`](./index.html)  
Live: https://willwinn.xyz/willwinn/photos/

## Auth / inbox

Same reviewer session and `../corrections/config.js` as corrections and stories (FormSubmit → `papiwinn@gmail.com`).

## Upload path

The browser sends **multipart** form data (fields + image file) to FormSubmit. The owner receives the photo as an email attachment, then saves it into [`../letters/images/`](../letters/images/) (see that folder’s README).

## Return

Buttons pass `?from=` (same pattern as stories). After thank-you, Return goes back to the list page.
