/**
 * Cloudflare Worker: family album notes → other-photos/notes.json
 *
 * Deploy options:
 *   A) Add this logic under path /notes on existing Worker icy-dust-9cb5
 *      (see photos/upload-worker.js — it routes /notes here).
 *   B) Paste this file as its own Worker; set albumNotesEndpoint to that URL.
 *
 * Secret: GITHUB_TOKEN (Contents Read/Write on papiwinn/willwinn)
 * Optional: GITHUB_REPO=papiwinn/willwinn  NOTES_PATH=other-photos/notes.json
 *
 * GET  → { ok, notes: [...] }  (live from GitHub)
 * POST → JSON or form: photo_id, text, uid, name, email, submitted_at
 *        appends to notes.json and returns { ok, note }
 */
export default {
  async fetch(request, env) {
    return handleAlbumNotes(request, env);
  },
};

export async function handleAlbumNotes(request, env) {
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
async function githubGet(repo, path, token) {
  const res = await fetch("https://api.github.com/repos/" + repo + "/contents/" + path, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "User-Agent": "willwinn-album-notes",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
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
