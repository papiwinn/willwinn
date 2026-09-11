/**
 * Optional Cloudflare Worker (or compatible) proxy.
 * Holds GITHUB_TOKEN as a Worker secret — never in the static site.
 *
 * Deploy (Cloudflare):
 *   1. Create a Worker, paste this file
 *   2. Settings → Variables → add secret GITHUB_TOKEN
 *      (fine-grained PAT: Issues Read/Write on papiwinn/willwinn only)
 *   3. Optional vars: GITHUB_REPO=papiwinn/willwinn  LABEL=correction
 *   4. Paste the Worker URL into corrections/config.js → formEndpoint
 *
 * The site POSTs JSON: { uid, submitted_at, user_id, name, email, mistake, where, corrections }
 */
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405);
    }
    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const required = ["uid", "submitted_at", "user_id", "name", "email", "mistake", "where", "corrections"];
    for (const k of required) {
      if (!data[k] || String(data[k]).trim() === "") {
        return json({ error: "Missing " + k }, 400);
      }
    }
    const token = env.GITHUB_TOKEN;
    if (!token) return json({ error: "Server not configured" }, 500);
    const repo = env.GITHUB_REPO || "papiwinn/willwinn";
    const label = env.LABEL || "correction";
    const title = "[correction] " + String(data.where).slice(0, 72);
    const body = [
      "<!-- uid -->" + data.uid + "<!-- /uid -->",
      "<!-- submitted_at -->" + data.submitted_at + "<!-- /submitted_at -->",
      "<!-- user_id -->" + data.user_id + "<!-- /user_id -->",
      "<!-- name -->" + data.name + "<!-- /name -->",
      "<!-- email -->" + data.email + "<!-- /email -->",
      "<!-- mistake -->" + data.mistake + "<!-- /mistake -->",
      "<!-- where -->" + data.where + "<!-- /where -->",
      "<!-- corrections -->" + data.corrections + "<!-- /corrections -->",
      "",
      "### Submission uid", data.uid, "",
      "### Submitted at", data.submitted_at, "",
      "### Reviewer user id", data.user_id, "",
      "### Reviewer name", data.name, "",
      "### Reviewer email", data.email, "",
      "### Describe Mistake", data.mistake, "",
      "### Where it is", data.where, "",
      "### Corrections", data.corrections, "",
    ].join("\n");

    const res = await fetch("https://api.github.com/repos/" + repo + "/issues", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "User-Agent": "willwinn-corrections-proxy",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ title, body, labels: [label] }),
    });
    if (!res.ok) {
      const text = await res.text();
      return json({ error: "GitHub " + res.status, detail: text.slice(0, 300) }, 502);
    }
    const issue = await res.json();
    return json({ ok: true, issue_number: issue.number, issue_url: issue.html_url }, 200);
  },
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}
