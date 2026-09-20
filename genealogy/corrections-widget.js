/* Genealogy family contributions widget.
 * Auth: same willwinn_reviewer + ww_* cookies as letters corrections.
 * Modes: comment | portrait | vitals — portraits/vitals publish live (UNVERIFIED); FACT HTML still only edited by William.
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
    var m = document.cookie.match(
      new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
    );
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

  function portraitEndpoint() {
    var cfg = window.CORRECTIONS_CONFIG || {};
    return (cfg.genealogyPortraitEndpoint || "").trim();
  }

  function vitalsEndpoint() {
    var cfg = window.CORRECTIONS_CONFIG || {};
    return (cfg.genealogyVitalsEndpoint || "").trim();
  }

  function appendOutbox(payload) {
    try {
      var list = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
      list.push(payload);
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function notifyEmail(subject, fields, done, fail) {
    var dest = configuredEndpoint();
    if (!dest) {
      fail("Inbox not configured (corrections/config.js).");
      return;
    }
    var url;
    var headers = { Accept: "application/json", "Content-Type": "application/json" };
    var body;
    if (dest.type === "web3forms") {
      url = "https://api.web3forms.com/submit";
      body = JSON.stringify(Object.assign({ access_key: dest.key, subject: subject }, fields));
    } else if (dest.type === "formsubmit") {
      url = dest.url;
      body = JSON.stringify(Object.assign({ _subject: subject, _template: "table" }, fields));
    } else {
      url = dest.url;
      body = JSON.stringify(Object.assign({ subject: subject }, fields));
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
      .then(done)
      .catch(function (ex) {
        fail(ex && ex.message ? ex.message : "Notify failed.");
      });
  }

  function injectStyles() {
    if (document.getElementById("ww-gene-corr-styles")) return;
    var css = document.createElement("style");
    css.id = "ww-gene-corr-styles";
    css.textContent = [
      "#ww-gene-corr-btn{position:fixed;right:18px;bottom:18px;z-index:9998;width:52px;height:52px;border-radius:50%;border:none;background:#e94560;color:#fff;font-size:1.35rem;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);line-height:1}",
      "#ww-gene-corr-btn:hover{background:#ff6b6b}",
      "#ww-gene-corr-overlay{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);padding:20px;overflow:auto}",
      "#ww-gene-corr-overlay.open{display:flex;align-items:flex-start;justify-content:center}",
      "#ww-gene-corr-panel{width:100%;max-width:520px;margin:40px auto;background:#16213e;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:20px 18px 16px;color:#fff;font-family:system-ui,-apple-system,sans-serif}",
      "#ww-gene-corr-panel h2{margin:0 0 6px;font-size:1.25rem}",
      "#ww-gene-corr-panel .sub{opacity:.75;font-size:.9rem;margin:0 0 14px;line-height:1.4}",
      "#ww-gene-corr-panel label{display:block;font-size:.9rem;font-weight:600;margin:0 0 6px}",
      "#ww-gene-corr-panel .hint{font-size:.8rem;opacity:.7;margin:-2px 0 8px;font-weight:400}",
      "#ww-gene-corr-panel input,#ww-gene-corr-panel textarea,#ww-gene-corr-panel select{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff;font:inherit;margin-bottom:14px}",
      "#ww-gene-corr-panel textarea{min-height:90px;resize:vertical}",
      "#ww-gene-corr-panel .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:4px}",
      "#ww-gene-corr-panel .btn{display:inline-block;padding:10px 18px;background:#e94560;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:.95rem;cursor:pointer}",
      "#ww-gene-corr-panel .btn:hover{background:#ff6b6b}",
      "#ww-gene-corr-panel .btn.secondary{background:transparent;border:2px solid #e94560}",
      "#ww-gene-corr-panel .btn:disabled{opacity:.5;cursor:not-allowed}",
      "#ww-gene-corr-panel .welcome{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-bottom:14px;padding:10px 12px;background:rgba(233,69,96,.12);border:1px solid rgba(233,69,96,.45);border-radius:8px;font-size:.9rem}",
      "#ww-gene-corr-panel .tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}",
      "#ww-gene-corr-panel .tab{padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;cursor:pointer;font-size:.85rem}",
      "#ww-gene-corr-panel .tab.active{background:#e94560;border-color:#e94560}",
      "#ww-gene-corr-panel .msg{margin-top:12px;padding:10px 12px;border-radius:8px;display:none;font-size:.9rem;line-height:1.4}",
      "#ww-gene-corr-panel .msg.error{display:block;background:rgba(233,69,96,.2);border:1px solid #e94560}",
      "#ww-gene-corr-panel .msg.ok{display:block;background:rgba(46,204,113,.15);border:1px solid rgba(46,204,113,.45)}",
      "#ww-gene-corr-panel .hidden{display:none!important}",
      "#ww-gene-corr-panel .grid2{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}",
      "@media(max-width:560px){#ww-gene-corr-panel .grid2{grid-template-columns:1fr}}",
      "#ww-gene-corr-close{float:right;background:transparent;border:none;color:#fff;font-size:1.4rem;cursor:pointer;line-height:1;opacity:.7;padding:0 4px}"
    ].join("");
    document.head.appendChild(css);
  }

  function buildUI() {
    injectStyles();
    var meta = pageMeta();
    var mode = "comment";

    var btn = document.createElement("button");
    btn.id = "ww-gene-corr-btn";
    btn.type = "button";
    btn.title = "Comment, propose vitals, or upload a portrait";
    btn.setAttribute("aria-label", "Comment, propose vitals, or upload a portrait");
    btn.textContent = "✎";
    document.body.appendChild(btn);

    var overlay = document.createElement("div");
    overlay.id = "ww-gene-corr-overlay";
    overlay.innerHTML =
      '<div id="ww-gene-corr-panel" role="dialog" aria-modal="true">' +
      '<button type="button" id="ww-gene-corr-close" aria-label="Close">×</button>' +
      "<h2>Contribute to this page</h2>" +
      '<p class="sub">About <strong id="ww-gene-corr-about"></strong>. Comments stay for William’s review. Portraits and vitals publish on this page right away (vitals as UNVERIFIED). FACT HTML is only edited by William.</p>' +
      '<div id="ww-gene-auth-block">' +
      '<form id="ww-gene-auth-form">' +
      '<label for="ww-gene-auth-name">Your name</label>' +
      '<input id="ww-gene-auth-name" type="text" required autocomplete="name" />' +
      '<label for="ww-gene-auth-email">Your email</label>' +
      '<input id="ww-gene-auth-email" type="email" required autocomplete="email" />' +
      '<p class="hint">Same sign-in as letters corrections. Stored in this browser only.</p>' +
      '<div class="row"><button class="btn" type="submit">Continue</button></div>' +
      "</form></div>" +
      '<div id="ww-gene-form-block" class="hidden">' +
      '<div class="welcome"><span>Signed in as <strong id="ww-gene-who"></strong></span>' +
      '<button type="button" class="btn secondary" id="ww-gene-signout">Sign out</button></div>' +
      '<div class="tabs">' +
      '<button type="button" class="tab active" data-mode="comment">Comment</button>' +
      '<button type="button" class="tab" data-mode="portrait">Portrait</button>' +
      '<button type="button" class="tab" data-mode="vitals">Vitals</button>' +
      "</div>" +
      '<form id="ww-gene-comment-form">' +
      '<label for="ww-gene-comment">What to correct or comment on</label>' +
      '<textarea id="ww-gene-comment" required placeholder="Describe the correction or add a family note…"></textarea>' +
      '<label for="ww-gene-where">Where on this page <span style="font-weight:400;opacity:.7">(optional)</span></label>' +
      '<input id="ww-gene-where" type="text" placeholder="e.g. Timeline → parents" />' +
      '<div class="row"><button class="btn" type="submit">Submit comment</button></div>' +
      "</form>" +
      '<form id="ww-gene-portrait-form" class="hidden">' +
      '<p class="hint">Photos appear on this page in the gallery (and as the top portrait if none exists yet). William gets an email copy. Multiple photos are supported.</p>' +
      '<label for="ww-gene-portrait-file">Portrait image</label>' +
      '<input id="ww-gene-portrait-file" type="file" accept="image/*" required />' +
      '<label for="ww-gene-portrait-note">Note <span style="font-weight:400;opacity:.7">(optional)</span></label>' +
      '<input id="ww-gene-portrait-note" type="text" placeholder="Who is in the photo, year, source…" />' +
      '<div class="row"><button class="btn" type="submit" id="ww-gene-portrait-submit">Publish portrait</button></div>' +
      "</form>" +
      '<form id="ww-gene-vitals-form" class="hidden">' +
      '<p class="hint">Vitals show on this page immediately as <strong>UNVERIFIED</strong> (with your name). William may later promote them to FACT.</p>' +
      '<div class="grid2">' +
      '<div><label for="ww-gene-dob">Date of birth</label><input id="ww-gene-dob" type="text" placeholder="e.g. 13 Feb 1924" /></div>' +
      '<div><label for="ww-gene-dod">Date of death</label><input id="ww-gene-dod" type="text" placeholder="e.g. 16 Nov 1996" /></div>' +
      '<div><label for="ww-gene-birthplace">Birthplace</label><input id="ww-gene-birthplace" type="text" /></div>' +
      '<div><label for="ww-gene-deathplace">Death place</label><input id="ww-gene-deathplace" type="text" /></div>' +
      '<div><label for="ww-gene-mdate">Marriage date</label><input id="ww-gene-mdate" type="text" /></div>' +
      '<div><label for="ww-gene-mplace">Marriage place</label><input id="ww-gene-mplace" type="text" /></div>' +
      "</div>" +
      '<label for="ww-gene-mspouse">Marriage spouse</label>' +
      '<input id="ww-gene-mspouse" type="text" />' +
      '<label for="ww-gene-other">Other vitals / notes</label>' +
      '<textarea id="ww-gene-other" placeholder="Burial, additional marriages, sources…"></textarea>' +
      '<div class="row"><button class="btn" type="submit">Post vitals (UNVERIFIED)</button></div>' +
      "</form>" +
      '<div class="msg" id="ww-gene-msg" role="status"></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn secondary" type="button" id="ww-gene-cancel">Close</button></div>' +
      "</div></div>";
    document.body.appendChild(overlay);
    document.getElementById("ww-gene-corr-about").textContent = meta.person_name;

    var msgEl = document.getElementById("ww-gene-msg");

    function setMsg(ok, text) {
      msgEl.className = "msg " + (ok ? "ok" : "error");
      msgEl.textContent = text;
    }

    function clearMsg() {
      msgEl.className = "msg";
      msgEl.textContent = "";
    }

    function showMode(m) {
      mode = m;
      document.querySelectorAll("#ww-gene-corr-panel .tab").forEach(function (t) {
        t.classList.toggle("active", t.getAttribute("data-mode") === m);
      });
      document.getElementById("ww-gene-comment-form").classList.toggle("hidden", m !== "comment");
      document.getElementById("ww-gene-portrait-form").classList.toggle("hidden", m !== "portrait");
      document.getElementById("ww-gene-vitals-form").classList.toggle("hidden", m !== "vitals");
      clearMsg();
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

    function open() {
      overlay.classList.add("open");
      paint();
    }
    function close() {
      overlay.classList.remove("open");
      clearMsg();
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

    document.querySelectorAll("#ww-gene-corr-panel .tab").forEach(function (t) {
      t.addEventListener("click", function () {
        showMode(t.getAttribute("data-mode"));
      });
    });

    document.getElementById("ww-gene-comment-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var s = session();
      if (!s) return paint();
      var m = pageMeta();
      var comment = document.getElementById("ww-gene-comment").value.trim();
      var where = document.getElementById("ww-gene-where").value.trim();
      var payload = {
        kind: "genealogy_correction",
        person_slug: m.person_slug,
        person_name: m.person_name,
        page_url: m.page_url,
        comment: comment,
        where: where || "(not specified)",
        name: s.name,
        email: s.email,
        uid: s.uid,
        submitted_at: new Date().toISOString()
      };
      notifyEmail(
        "[Genealogy correction] " + m.person_name,
        payload,
        function () {
          appendOutbox(payload);
          document.getElementById("ww-gene-comment-form").reset();
          setMsg(true, "We will review your information and let you know when corrections are made. Thank you.");
        },
        function (err) {
          setMsg(false, err);
        }
      );
    });

    document.getElementById("ww-gene-portrait-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var s = session();
      if (!s) return paint();
      var endpoint = portraitEndpoint();
      if (!endpoint) {
        setMsg(false, "Portrait upload endpoint not configured. Ask William to redeploy icy-dust.");
        return;
      }
      var fileInput = document.getElementById("ww-gene-portrait-file");
      var file = fileInput.files && fileInput.files[0];
      if (!file) {
        setMsg(false, "Choose an image file.");
        return;
      }
      var m = pageMeta();
      var note = document.getElementById("ww-gene-portrait-note").value.trim();
      var fd = new FormData();
      fd.append("attachment", file);
      fd.append("person_slug", m.person_slug);
      fd.append("person_name", m.person_name);
      fd.append("note", note);
      fd.append("uid", s.uid);
      fd.append("name", s.name);
      fd.append("email", s.email);
      fd.append("submitted_at", new Date().toISOString());
      var submitBtn = document.getElementById("ww-gene-portrait-submit");
      submitBtn.disabled = true;
      clearMsg();
      fetch(endpoint, { method: "POST", body: fd })
        .then(function (res) {
          return res.json().then(function (j) {
            if (!res.ok) throw new Error((j && (j.error || j.detail)) || "Upload failed");
            return j;
          });
        })
        .then(function (j) {
          appendOutbox({ kind: "genealogy_portrait", result: j, person_slug: m.person_slug });
          notifyEmail(
            "[Genealogy portrait] " + m.person_name,
            {
              kind: "genealogy_portrait",
              person_slug: m.person_slug,
              person_name: m.person_name,
              page_url: m.page_url,
              gallery_path: j.gallery_path || "",
              download_url: j.download_url || "",
              note: note || "(none)",
              name: s.name,
              email: s.email,
              uid: s.uid,
              submitted_at: new Date().toISOString(),
              instruction: "Published to gallery (and primary if none). Awareness copy only — family can already see it on the person page."
            },
            function () {
              submitBtn.disabled = false;
              document.getElementById("ww-gene-portrait-form").reset();
              setMsg(true, "Portrait published to this person’s gallery. William was emailed a copy.");
            },
            function (err) {
              submitBtn.disabled = false;
              setMsg(
                true,
                "Portrait saved (" +
                  (j.gallery_path || "ok") +
                  "). Email notify had a problem (" +
                  err +
                  ") — photo is still in the gallery; check contributions.json."
              );
            }
          );
        })
        .catch(function (ex) {
          submitBtn.disabled = false;
          setMsg(false, ex && ex.message ? ex.message : "Upload failed. Worker may need redeploy.");
        });
    });

    document.getElementById("ww-gene-vitals-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var s = session();
      if (!s) return paint();
      var m = pageMeta();
      var entry = {
        kind: "genealogy_vitals",
        status: "unverified",
        label: "UNVERIFIED — family submission (not FACT until William promotes)",
        person_slug: m.person_slug,
        person_name: m.person_name,
        page_url: m.page_url,
        dob: document.getElementById("ww-gene-dob").value.trim(),
        dod: document.getElementById("ww-gene-dod").value.trim(),
        birthplace: document.getElementById("ww-gene-birthplace").value.trim(),
        death_place: document.getElementById("ww-gene-deathplace").value.trim(),
        marriage_date: document.getElementById("ww-gene-mdate").value.trim(),
        marriage_place: document.getElementById("ww-gene-mplace").value.trim(),
        marriage_spouse: document.getElementById("ww-gene-mspouse").value.trim(),
        other: document.getElementById("ww-gene-other").value.trim(),
        name: s.name,
        email: s.email,
        uid: s.uid,
        submitted_at: new Date().toISOString()
      };
      var hasAny =
        entry.dob ||
        entry.dod ||
        entry.birthplace ||
        entry.death_place ||
        entry.marriage_date ||
        entry.marriage_place ||
        entry.marriage_spouse ||
        entry.other;
      if (!hasAny) {
        setMsg(false, "Enter at least one vital or note.");
        return;
      }

      function finishOk(extra) {
        appendOutbox(entry);
        document.getElementById("ww-gene-vitals-form").reset();
        setMsg(
          true,
          "Vitals posted as UNVERIFIED on this page" +
            (extra || "") +
            ". They are attributed to you and are not FACT until William promotes them."
        );
      }

      var vEndpoint = vitalsEndpoint();
      if (!vEndpoint) {
        setMsg(false, "Vitals endpoint not configured. Ask William to redeploy icy-dust.");
        return;
      }
      fetch(vEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      })
        .then(function (res) {
          return res.json().then(function (j) {
            if (!res.ok) throw new Error((j && (j.error || j.detail)) || "Publish failed");
            return j;
          });
        })
        .then(function () {
          notifyEmail(
            "[Genealogy vitals UNVERIFIED] " + m.person_name,
            entry,
            function () {
              finishOk("");
            },
            function (err) {
              finishOk(" (email notify failed: " + err + " — still on page)");
            }
          );
        })
        .catch(function (ex) {
          setMsg(false, ex && ex.message ? ex.message : "Could not publish vitals. Worker may need redeploy.");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
