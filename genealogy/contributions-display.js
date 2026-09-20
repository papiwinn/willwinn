/* Load family contributions for this person page: UNVERIFIED vitals + photo grid. */
(function () {
  "use strict";

  function slugFromPath() {
    var parts = location.pathname.split("/").filter(function (p) {
      return p.length > 0;
    });
    if (!parts.length) return "";
    var last = parts[parts.length - 1].replace(/\.html$/, "");
    // Pretty URL /genealogy/people/fannie-winn or .../fannie-winn/
    if (last === "people" && parts.length >= 2) {
      return parts[parts.length - 1]; // shouldn't happen after filter
    }
    if (last === "index") return "";
    return last;
  }

  function absGenealogyUrl(rel) {
    // Force site-root absolute paths so pretty URLs (/people/slug/) don't break ../
    var s = String(rel || "").replace(/^\.\.\//, "").replace(/^\//, "");
    if (s.indexOf("genealogy/") === 0) return "/" + s;
    return "/genealogy/" + s;
  }

  function injectStyles() {
    if (document.getElementById("ww-gene-contrib-styles")) return;
    var s = document.createElement("style");
    s.id = "ww-gene-contrib-styles";
    s.textContent = [
      ".ww-unverified{margin:28px 0 8px;padding:16px 16px 12px;border-radius:10px;border:1px dashed rgba(233,69,96,.55);background:rgba(233,69,96,.08)}",
      ".ww-unverified h2{margin:0 0 8px;font-size:1.15rem;color:#ffb3c0}",
      ".ww-unverified .tag-u{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;margin-right:6px;background:rgba(233,69,96,.22);border:1px solid rgba(233,69,96,.5);color:#ffb3c0}",
      ".ww-unverified .item{margin:0 0 12px;padding:10px 12px;border-radius:8px;background:rgba(0,0,0,.22);font-size:.92rem;line-height:1.45}",
      ".ww-unverified .by{opacity:.75;font-size:.82rem;margin-top:6px}",
      ".ww-photo-grid-wrap{margin:32px 0 8px;padding:16px 16px 12px;border-radius:10px;border:1px solid rgba(233,69,96,.35);background:rgba(233,69,96,.06)}",
      ".ww-photo-grid-wrap h2{margin:0 0 12px;font-size:1.2rem;color:#e94560}",
      ".ww-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}",
      ".ww-photo-grid figure{margin:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;overflow:hidden}",
      ".ww-photo-grid img{display:block;width:100%;aspect-ratio:1;object-fit:cover}",
      ".ww-photo-grid figcaption{padding:8px 10px;font-size:.78rem;opacity:.8;line-height:1.35}"
    ].join("");
    document.head.appendChild(s);
  }

  function fieldList(v) {
    var rows = [];
    function add(label, val) {
      if (val) rows.push("<div><strong>" + label + ":</strong> " + escapeHtml(val) + "</div>");
    }
    add("Date of birth", v.dob);
    add("Date of death", v.dod);
    add("Birthplace", v.birthplace);
    add("Death place", v.death_place);
    add("Marriage date", v.marriage_date);
    add("Marriage place", v.marriage_place);
    add("Spouse", v.marriage_spouse);
    add("Other", v.other);
    return rows.join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(data) {
    var slug = slugFromPath();
    if (!slug || slug === "index") return;
    var block = (data && data[slug]) || { vitals: [], portraits: [] };
    var vitals = Array.isArray(block.vitals) ? block.vitals : [];
    var portraits = Array.isArray(block.portraits) ? block.portraits : [];
    var footer = document.querySelector("footer.colophon");
    var container = document.querySelector(".container");
    if (!container) return;

    injectStyles();

    if (vitals.length) {
      var uv = document.createElement("section");
      uv.className = "ww-unverified";
      uv.innerHTML =
        "<h2><span class=\"tag-u\">Unverified</span> Family-submitted vitals</h2>" +
        "<p style=\"opacity:.8;font-size:.88rem;margin:0 0 12px\">These are not Crystal/William FACT until reviewed. Each entry shows who submitted it.</p>";
      vitals.forEach(function (v) {
        var div = document.createElement("div");
        div.className = "item";
        var when = v.submitted_at || v.submittedAt || "";
        div.innerHTML =
          fieldList(v) +
          '<div class="by">Submitted by ' +
          escapeHtml(v.name || "unknown") +
          (when ? " · " + escapeHtml(String(when).slice(0, 10)) : "") +
          "</div>";
        uv.appendChild(div);
      });
      if (footer) container.insertBefore(uv, footer);
      else container.appendChild(uv);
    }

    if (portraits.length) {
      var wrap = document.createElement("section");
      wrap.className = "ww-photo-grid-wrap";
      wrap.id = "ww-more-photos";
      wrap.innerHTML = "<h2>More photos</h2>";
      var grid = document.createElement("div");
      grid.className = "ww-photo-grid";
      portraits.forEach(function (p) {
        var fig = document.createElement("figure");
        var src = p.src || "";
        if (src && src.indexOf("http") !== 0) {
          src = absGenealogyUrl(src);
        }
        var when = p.submitted_at || p.submittedAt || "";
        fig.innerHTML =
          '<img src="' +
          escapeHtml(src) +
          '" alt="" loading="lazy" />' +
          "<figcaption>" +
          escapeHtml(p.name || "Family") +
          (p.note ? " — " + escapeHtml(p.note) : "") +
          (when ? " · " + escapeHtml(String(when).slice(0, 10)) : "") +
          "</figcaption>";
        grid.appendChild(fig);
      });
      wrap.appendChild(grid);
      if (footer) container.insertBefore(wrap, footer);
      else container.appendChild(wrap);
    }
  }

  var url = "/genealogy/data/contributions.json";
  fetch(url, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) return {};
      return r.json();
    })
    .then(render)
    .catch(function () {});
})();
