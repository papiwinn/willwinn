/**
 * Cloudflare Worker for willwinn (icy-dust-9cb5):
 *   POST /           → photo upload → letters/images/
 *   GET|POST /notes  → family album notes → other-photos/notes.json
 *
 * Secret: GITHUB_TOKEN (Contents Read/Write on papiwinn/willwinn)
 * Optional: GITHUB_REPO, IMAGES_PATH, NOTES_PATH
 *
 * config.js:
 *   photoEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev"
 *   albumNotesEndpoint: "https://icy-dust-9cb5.papiwinn.workers.dev/notes"
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/notes" || path.endsWith("/notes")) {
      return handleAlbumNotes(request, env);
    }
    return handlePhotoUpload(request, env);
  },
};

async function handlePhotoUpload(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== "POST") {
    return json({ error: "POST only (use /notes for album notes)" }, 405);
  }

  const token = env.GITHUB_TOKEN;
  if (!token) return json({ error: "Server not configured (missing GITHUB_TOKEN)" }, 500);

  const repo = env.GITHUB_REPO || "papiwinn/willwinn";
  const imagesPath = (env.IMAGES_PATH || "letters/images").replace(/\/$/, "");

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart form data" }, 400);
  }

  const file = form.get("attachment");
  if (!file || typeof file === "string" || !file.size) {
    return json({ error: "Missing photo file (attachment)" }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return json({ error: "File larger than 5 MB" }, 400);
  }

  const person = String(form.get("person_name") || "").trim();
  const photoDate = String(form.get("photo_date") || "").trim();
  const photoLocation = String(form.get("photo_location") || "").trim();
  const uid = String(form.get("uid") || "").trim();
  const submittedAt = String(form.get("submitted_at") || new Date().toISOString()).trim();
  const userId = String(form.get("user_id") || "").trim();
  const reviewerName = String(form.get("name") || "").trim();
  const reviewerEmail = String(form.get("email") || "").trim();

  if (!person || !photoDate || !photoLocation) {
    return json({ error: "Missing person_name, photo_date, or photo_location" }, 400);
  }

  const ext = extFromFile(file);
  let base = filenameBase(photoDate, person, photoLocation);
  let path = imagesPath + "/" + base + ext;

  const exists = await githubGet(repo, path, token);
  if (exists) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let placed = false;
    for (const L of letters) {
      const candidate = imagesPath + "/" + base + L + ext;
      if (!(await githubGet(repo, candidate, token))) {
        path = candidate;
        base = base + L;
        placed = true;
        break;
      }
    }
    if (!placed) {
      path = imagesPath + "/" + base + "-" + (uid || crypto.randomUUID()).slice(0, 8) + ext;
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentB64 = btoa(chunk(bytes));

  const commitMessage =
    "Add photo: " + person + " (" + photoDate + ")\n\n" +
    "Submitted via Add a Photo form.\n" +
    "Location: " + photoLocation + "\n" +
    "Reviewer: " + reviewerName + " <" + reviewerEmail + ">\n" +
    "uid: " + uid;

  const put = await fetch(
    "https://api.github.com/repos/" + repo + "/contents/" + path,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "willwinn-photo-upload",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: contentB64,
        branch: "main",
      }),
    }
  );

  if (!put.ok) {
    const detail = (await put.text()).slice(0, 400);
    return json({ error: "GitHub " + put.status, detail }, 502);
  }

  const body = await put.json();
  const metaPath = imagesPath + "/submissions.jsonl";
  const metaLine = JSON.stringify({
    path,
    person_name: person,
    photo_date: photoDate,
    photo_location: photoLocation,
    uid,
    submitted_at: submittedAt,
    user_id: userId,
    name: reviewerName,
    email: reviewerEmail,
    html_url: body.content && body.content.html_url,
  }) + "\n";

  try {
    const existing = await githubGet(repo, metaPath, token);
    let prev = "";
    let sha;
    if (existing && existing.content) {
      prev = atob(existing.content.replace(/\n/g, ""));
      sha = existing.sha;
    }
    const metaPayload = {
      message: "Log photo submission " + path,
      content: btoa(prev + metaLine),
      branch: "main",
    };
    if (sha) metaPayload.sha = sha;
    await fetch("https://api.github.com/repos/" + repo + "/contents/" + metaPath, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "willwinn-photo-upload",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(metaPayload),
    });
  } catch (_) {}

  return json({
    ok: true,
    path,
    html_url: body.content && body.content.html_url,
    download_url: body.content && body.content.download_url,
  }, 200);
}

async function handleAlbumNotes(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }

  const token = env.GITHUB_TOKEN;
  if (!token) return json({ error: "Server not configured (missing GITHUB_TOKEN)" }, 500);

  const repo = env.GITHUB_REPO || "papiwinn/willwinn";
  const notesPath = env.NOTES_PATH || "other-photos/notes.json";

  if (request.method === "GET") {
    const notes = await readNotes(repo, notesPath, token);
    return json({ ok: true, notes }, 200);
  }

  if (request.method !== "POST") {
    return json({ error: "GET or POST only" }, 405);
  }

  let photoId = "";
  let text = "";
  let uid = "";
  let name = "";
  let email = "";
  let submittedAt = new Date().toISOString();

  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.indexOf("application/json") >= 0) {
      const body = await request.json();
      photoId = String(body.photo_id || body.photoId || "").trim();
      text = String(body.text || body.note || "").trim();
      uid = String(body.uid || body.user_id || "").trim();
      name = String(body.name || "").trim();
      email = String(body.email || "").trim();
      if (body.submitted_at) submittedAt = String(body.submitted_at).trim();
    } else {
      const form = await request.formData();
      photoId = String(form.get("photo_id") || "").trim();
      text = String(form.get("text") || form.get("note") || "").trim();
      uid = String(form.get("uid") || form.get("user_id") || "").trim();
      name = String(form.get("name") || "").trim();
      email = String(form.get("email") || "").trim();
      const sa = form.get("submitted_at");
      if (sa) submittedAt = String(sa).trim();
    }
  } catch {
    return json({ error: "Could not parse body" }, 400);
  }

  if (!photoId || !text) {
    return json({ error: "photo_id and text are required" }, 400);
  }
  if (text.length > 4000) {
    return json({ error: "Note too long (max 4000 characters)" }, 400);
  }
  if (!name || !email) {
    return json({ error: "name and email are required (sign in first)" }, 400);
  }

  const note = {
    id: crypto.randomUUID(),
    photo_id: photoId,
    text,
    name,
    email,
    uid: uid || "",
    submitted_at: submittedAt,
  };

  const existing = await githubGet(repo, notesPath, token);
  let notes = [];
  let sha;
  if (existing && existing.content) {
    try {
      const raw = atob(existing.content.replace(/\n/g, ""));
      notes = JSON.parse(raw || "[]");
      if (!Array.isArray(notes)) notes = [];
    } catch {
      notes = [];
    }
    sha = existing.sha;
  }
  notes.push(note);

  const contentB64 = btoa(unescape(encodeURIComponent(JSON.stringify(notes, null, 2) + "\n")));
  const putBody = {
    message: "Add album note on " + photoId + " by " + name,
    content: contentB64,
    branch: "main",
  };
  if (sha) putBody.sha = sha;

  const put = await fetch(
    "https://api.github.com/repos/" + repo + "/contents/" + notesPath,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "willwinn-album-notes",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(putBody),
    }
  );

  if (!put.ok) {
    const detail = (await put.text()).slice(0, 400);
    return json({ error: "GitHub " + put.status, detail }, 502);
  }

  return json({ ok: true, note, notes }, 200);
}

async function readNotes(repo, path, token) {
  const existing = await githubGet(repo, path, token);
  if (!existing || !existing.content) return [];
  try {
    const raw = atob(existing.content.replace(/\n/g, ""));
    const notes = JSON.parse(raw || "[]");
    return Array.isArray(notes) ? notes : [];
  } catch {
    return [];
  }
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40) || "photo";
}
function filenameBase(date, person, location) {
  const d = String(date).replace(/[^\d]/g, "");
  const datePart = d.length >= 4 ? d.slice(0, 8) : slug(date);
  return datePart + "-" + slug(person) + "-" + slug(location);
}
function extFromFile(file) {
  const name = (file.name || "").toLowerCase();
  const m = name.match(/\.(jpe?g|png|gif|webp)$/);
  if (m) return "." + m[1].replace("jpeg", "jpg");
  const t = (file.type || "").toLowerCase();
  if (t.indexOf("png") >= 0) return ".png";
  if (t.indexOf("webp") >= 0) return ".webp";
  if (t.indexOf("gif") >= 0) return ".gif";
  return ".jpg";
}
async function githubGet(repo, path, token) {
  const res = await fetch("https://api.github.com/repos/" + repo + "/contents/" + path, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "User-Agent": "willwinn-photo-upload",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}
function chunk(bytes) {
  const out = [];
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) {
    out.push(String.fromCharCode.apply(null, bytes.subarray(i, i + size)));
  }
  return out.join("");
}
