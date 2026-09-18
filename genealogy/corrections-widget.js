/* Genealogy correction/comment widget.
 * Reuses corrections/config.js (CORRECTIONS_CONFIG) and the same
 * willwinn_reviewer localStorage + ww_* cookies as letters corrections.
 * Submits text only to FormSubmit / formEndpoint / web3forms — never edits HTML.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "willwinn_reviewer";
  var OUTBOX_KEY = "willwinn_corrections_outbox";

  function isHub() {
    var p = location.pathname.replace(/\/+$/, "");
    return /\/genealogy$/.test(p) || /\/genealogy\/index\.html$/.test(p);
  }

  function pageMeta() {
    var path = location.pathname;
    var file = (path.split("/").pop() || "").replace(/\.html$/, "") || "index";
    var h1 = document.querySelector("h1");
    var name = h1 ? h1.textContent.trim() : (isHub() ? "Genealogy hub" : file);
    return {
      person_slug: isHub() ? "hub" : file,
      person_name: name,
      page_path: path,
      page_url: location.href
    };
  }

  function cookiePaths() {
    var parts = location.pathname.split("/").filter(Boolean);
    var paths = ["/"];
    var acc = "";
    for (var i = 0; i < parts.length; i++) {
      acc += "/" + parts[i];
      paths.push(acc);
      paths.push(acc + "/");
    }
    return paths;
  }

  function setCookie(name, value, days) {
    var exp = new Date(Date.now() + days * 864e5).toUTCString();
    cookiePaths().forEach(function (p) {
      document.cookie =
        name + "=" + encodeURIComponent(value) + "; expires=" + exp + "; path=" + p + "; SameSite=Lax";
    });
  }

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  function clearCookie(name) {
    cookiePaths().forEach(function (p) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + p + "; SameSite=Lax";
    });
  }

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStorage(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function session() {
    var s = readStorage();
    if (s && s.name && s.email) return s;
    var name = getCookie("ww_name");
    var email = getCookie("ww_email");
    var uid = getCookie("ww_uid");
    if (name && email) {
      var c = { uid: uid || uuid(), name: name, email: email };
      writeStorage(c);
      return c;
    }
    return null;
  }

  function persist(s) {
    writeStorage(s);
    setCookie("ww_uid", s.uid, 180);
    setCookie("ww_name", s.name, 180);
    setCookie("ww_email", s.email, 180);
  }

  function clearSession() {
    clearStorage();
    clearCookie("ww_uid");
    clearCookie("ww_name");
    clearCookie("ww_email");
  }

  function configuredEndpoint() {
    var cfg = window.CORRECTIONS_CONFIG || {};
    if (cfg.formEndpoint) return { type: "endpoint", url: cfg.formEndpoint };
    if (cfg.web3formsKey) return { type: "web3forms", key: cfg.web3formsKey };
    var em = (cfg.ownerEmail || "").trim();
    if (em) return { type: "formsubmit", url: "https://formsubmit.co/ajax/" + encodeURIComponent(em) };
    return null;
  }

  function appendOutbox(payload) {
    try {
      var list = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
      list.push(payload);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById("ww-gene-corr-styles")) return;
    var css = document.createElement("style");
    css.id = "ww-gene-corr-styles";
    css.textContent = [
      "#ww-gene-corr-btn{position:fixed;right:18px;bottom:18px;z-index:9998;width:52px;height:52px;border-radius:50%;border:none;background:#e94560;color:#fff;font-size:1.35rem;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);line-height:1}",
      "#ww-gene-corr-btn:hover{background:#ff6b6b}",
      "#ww-gene-corr-btn:focus{outline:2px solid #fff;outline-offset:2px}",
      "#ww-gene-corr-overlay{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);padding:20px;overflow:auto}",
      "#ww-gene-corr-overlay.open{display:flex;align-items:flex-start;justify-content:center}",
      "#ww-gene-corr-panel{width:100%;max-width:480px;margin:40px auto;background:#16213e;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:20px 18px 16px;color:#fff;font-family:system-ui,-apple-system,sans-serif}",
      "#ww-gene-corr-panel h2{margin:0 0 6px;font-size:1.25rem}",
      "#ww-gene-corr-panel .sub{opacity:.75;font-size:.9rem;margin:0 0 16px;line-height:1.4}",
      "#ww-gene-corr-panel label{display:block;font-size:.9rem;font-weight:600;margin:0 0 6px}",
      "#ww-gene-corr-panel .hint{font-size:.8rem;opacity:.7;margin:-2px 0 8px;font-weight:400}",
      "#ww-gene-corr-panel input,#ww-gene-corr-panel textarea{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff;font:inherit;margin-bottom:14px}",
      "#ww-gene-corr-panel textarea{min-height:100px;resize:vertical}",
      "#ww-gene-corr-panel .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:4px}",
      "#ww-gene-corr-panel .btn{display:inline-block;padding:10px 18px;background:#e94560;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:.95rem;cursor:pointer}",
      "#ww-gene-corr-panel .btn:hover{background:#ff6b6b}",
      "#ww-gene-corr-panel .btn.secondary{background:transparent;border:2px solid #e94560}",
      "#ww-gene-corr-panel .btn:disabled{opacity:.5;cursor:not-allowed}",
      "#ww-gene-corr-panel .welcome{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:14px;padding:10px 12px;background:rgba(233,69,96,.12);border:1px solid rgba(233,69,96,.45);border-radius:8px;font-size:.9rem}",
      "#ww-gene-corr-panel .msg{margin-top:12px;padding:10px 12px;border-radius:8px;display:none;font-size:.9rem;line-height:1.4}",
      "#ww-gene-corr-panel .msg.error{display:block;background:rgba(233,69,96,.2);border:1px solid #e94560}",
      "#ww-gene-corr-panel .msg.ok{display:block;background:rgba(46,204,113,.15);border:1px solid rgba(46,204,113,.45)}",
      "#ww-gene-corr-panel .hidden{display:none!important}",
      "#ww-gene-corr-close{float:right;background:transparent;border:none;color:#fff;font-size:1.4rem;cursor:pointer;line-height:1;opacity:.7;padding:0 4px}",
      "#ww-gene-corr-close:hover{opacity:1}"
    ].join("");
    document.head.appendChild(css);
  }

  function buildUI() {
    injectStyles();
    var meta = pageMeta();

    var btn = document.createElement("button");
    btn.id = "ww-gene-corr-btn";
    btn.type = "button";
    btn.title = "Suggest a correction or leave a comment";
    btn.setAttribute("aria-label", "Suggest a correction or leave a comment");
    btn.textContent = "✎";
    document.body.appendChild(btn);

    var overlay = document.createElement("div");
    overlay.id = "ww-gene-corr-overlay";
    overlay.innerHTML =
      '<div id="ww-gene-corr-panel" role="dialog" aria-modal="true" aria-labelledby="ww-gene-corr-title">' +
      '<button type="button" id="ww-gene-corr-close" aria-label="Close">×</button>' +
      '<h2 id="ww-gene-corr-title">Correction / comment</h2>' +
      '<p class="sub">About <strong id="ww-gene-corr-about"></strong>. William reviews every note before anything changes on the page.</p>' +
      '<div id="ww-gene-auth-block">' +
      '<form id="ww-gene-auth-form">' +
      '<label for="ww-gene-auth-name">Your name</label>' +
      '<input id="ww-gene-auth-name" name="name" type="text" required autocomplete="name" />' +
      '<label for="ww-gene-auth-email">Your email</label>' +
      '<input id="ww-gene-auth-email" name="email" type="email" required autocomplete="email" />' +
      '<p class="hint">Same sign-in as letters corrections. Stored in this browser only.</p>' +
      '<div class="row"><button class="btn" type="submit">Continue</button></div>' +
      "</form></div>" +
      '<div id="ww-gene-form-block" class="hidden">' +
      '<div class="welcome"><span>Signed in as <strong id="ww-gene-who"></strong></span>' +
      '<button type="button" class="btn secondary" id="ww-gene-signout">Sign out</button></div>' +
      '<form id="ww-gene-corr-form">' +
      '<label for="ww-gene-comment">What to correct or comment on</label>' +
      '<textarea id="ww-gene-comment" name="comment" required placeholder="Describe the correction or add a family note…"></textarea>' +
      '<label for="ww-gene-where">Where on this page <span style="font-weight:400;opacity:.7">(optional)</span></label>' +
      '<input id="ww-gene-where" name="where" type="text" placeholder="e.g. Timeline → parents, Sources list…" />' +
      '<div class="row">' +
      '<button class="btn" type="submit" id="ww-gene-submit">Submit</button>' +
      '<button class="btn secondary" type="button" id="ww-gene-cancel">Cancel</button>' +
      "</div>" +
      '<div class="msg" id="ww-gene-msg" role="status"></div>' +
      "</form></div></div>";
    document.body.appendChild(overlay);
    document.getElementById("ww-gene-corr-about").textContent = meta.person_name;

    function open() {
      overlay.classList.add("open");
      paint();
    }
    function close() {
      overlay.classList.remove("open");
      var msg = document.getElementById("ww-gene-msg");
      msg.className = "msg";
      msg.textContent = "";
    }

    function paint() {
      var s = session();
      var auth = document.getElementById("ww-gene-auth-block");
      var form = document.getElementById("ww-gene-form-block");
      if (s) {
        auth.classList.add("hidden");
        form.classList.remove("hidden");
        document.getElementById("ww-gene-who").textContent = s.name + " (" + s.email + ")";
      } else {
        auth.classList.remove("hidden");
        form.classList.add("hidden");
      }
    }

    btn.addEventListener("click", open);
    document.getElementById("ww-gene-corr-close").addEventListener("click", close);
    document.getElementById("ww-gene-cancel").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    document.getElementById("ww-gene-auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("ww-gene-auth-name").value.trim();
      var email = document.getElementById("ww-gene-auth-email").value.trim();
      if (!name || !email) return;
      persist({ uid: uuid(), name: name, email: email });
      paint();
    });

    document.getElementById("ww-gene-signout").addEventListener("click", function () {
      clearSession();
      paint();
    });

    document.getElementById("ww-gene-corr-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var s = session();
      if (!s) {
        paint();
        return;
      }
      var dest = configuredEndpoint();
      var msg = document.getElementById("ww-gene-msg");
      var submitBtn = document.getElementById("ww-gene-submit");
      if (!dest) {
        msg.className = "msg error";
        msg.textContent = "Inbox not configured (corrections/config.js).";
        return;
      }

      var m = pageMeta();
      var comment = document.getElementById("ww-gene-comment").value.trim();
      var where = document.getElementById("ww-gene-where").value.trim();
      var payload = {
        kind: "genealogy_correction",
        person_slug: m.person_slug,
        person_name: m.person_name,
        page_path: m.page_path,
        page_url: m.page_url,
        comment: comment,
        where: where,
        uid: s.uid,
        user_id: s.uid,
        name: s.name,
        email: s.email,
        submitted_at: new Date().toISOString()
      };

      submitBtn.disabled = true;
      msg.className = "msg";
      msg.textContent = "";

      function fail(text) {
        submitBtn.disabled = false;
        msg.className = "msg error";
        msg.textContent = text || "Submit failed. Please try again.";
      }

      var url;
      var headers = { Accept: "application/json" };
      var body;
      if (dest.type === "web3forms") {
        url = "https://api.web3forms.com/submit";
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          access_key: dest.key,
          subject: "[Genealogy] " + m.person_name,
          from_name: s.name,
          email: s.email,
          kind: payload.kind,
          person_slug: payload.person_slug,
          person_name: payload.person_name,
          page_url: payload.page_url,
          where: payload.where,
          comment: payload.comment,
          uid: payload.uid,
          submitted_at: payload.submitted_at
        });
      } else if (dest.type === "formsubmit") {
        url = dest.url;
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({
          _subject: "[Genealogy correction] " + m.person_name,
          kind: payload.kind,
          person_slug: payload.person_slug,
          person_name: payload.person_name,
          page_path: payload.page_path,
          page_url: payload.page_url,
          where: payload.where || "(not specified)",
          comment: payload.comment,
          name: payload.name,
          email: payload.email,
          uid: payload.uid,
          submitted_at: payload.submitted_at,
          _template: "table"
        });
      } else {
        url = dest.url;
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(payload);
      }

      fetch(url, { method: "POST", headers: headers, body: body })
        .then(function (res) {
          if (!res.ok) {
            return res.text().then(function (t) {
              throw new Error(t || "HTTP " + res.status);
            });
          }
          return res.json().catch(function () {
            return {};
          });
        })
        .then(function () {
          appendOutbox(payload);
          document.getElementById("ww-gene-corr-form").reset();
          submitBtn.disabled = false;
          msg.className = "msg ok";
          msg.textContent =
            "We will review your information and let you know when corrections are made. Thank you.";
        })
        .catch(function (ex) {
          fail(ex && ex.message ? ex.message : "Submit failed.");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
