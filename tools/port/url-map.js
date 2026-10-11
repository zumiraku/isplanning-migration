const fs = require("fs");

function readCsv(p) {
  const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  return raw.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const c = []; let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; continue; }
      if (ch === "," && !q) { c.push(cur); cur = ""; continue; }
      cur += ch;
    }
    c.push(cur);
    return c;
  });
}

const LINK = new RegExp('(href=")((?:https?://www\\.isp-sp\\.com)?/(?:shopbrand|shopdetail|html|shop|new)/[^"]*)(")', "gi");

const map = new Map();
for (const f of ["categories-url.csv", "freepages-url.csv", "news-url.csv", "pagetypes-url.csv", "products-url.csv"]) {
  const p = "package/url-bulk/" + f;
  if (!fs.existsSync(p)) continue;
  for (const c of readCsv(p)) {
    const sys = c[1], old = c[4];
    if (!sys || !old) continue;
    const bare = old.endsWith("/") ? old.slice(0, -1) : old;
    map.set(bare, sys);
    map.set(old, sys);
  }
}

map.set("/html/email.html", "<{$url.support}>");

function searchLink(url) {
  const q = url.indexOf("?");
  if (q < 0) { return null; }
  const params = url.slice(q + 1).split("&");
  let word = null;
  const keep = [];
  for (const kv of params) {
    const eq = kv.indexOf("=");
    const k = eq < 0 ? kv : kv.slice(0, eq);
    const v = eq < 0 ? "" : kv.slice(eq + 1);
    if (!v) { continue; }
    if (k === "search") {
      try {
        const bytes = Buffer.from(v.split("%").filter(Boolean).map(h => parseInt(h.slice(0, 2), 16)));
        word = new TextDecoder("euc-jp").decode(bytes);
      } catch (e) { word = decodeURIComponent(v); }
      continue;
    }
    keep.push(k + "=" + v);
  }
  if (word === null) { return null; }
  return "/view/search?search_keyword=" + encodeURIComponent(word) +
    (keep.length ? "&" + keep.join("&") : "");
}

function rewrite(html) {
  let n = 0;
  const miss = new Set();
  const out = html.replace(LINK, (m, pre, url, post) => {
    if (url.indexOf("/shop/shopbrand.html") >= 0) {
      const to = searchLink(url);
      if (to) { n++; return pre + to + post; }
    }
    const clean = url.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
    const hash = clean.indexOf("#");
    const base = hash < 0 ? clean : clean.slice(0, hash);
    const frag = hash < 0 ? "" : clean.slice(hash);
    const bare = base.endsWith("/") ? base.slice(0, -1) : base;
    let to = map.get(bare) || map.get(base);

    if (!to) {
      let probe = bare;
      while (!to && probe.split("/").length > 2) {
        probe = probe.slice(0, probe.lastIndexOf("/"));
        to = map.get(probe);
      }
    }
    if (!to) { miss.add(url); return m; }
    n++;
    return pre + to + frag + post;
  });
  return { html: out, rewritten: n, missing: [...miss] };
}

module.exports = { map, rewrite };

if (require.main === module) {
  console.log("対応表: " + map.size + " 件");
  const t = rewrite([
    '<a href="/shopbrand/003/001/X/">a</a>',
    '<a href="/html/page9.html">b</a>',
    '<a href="/html/info.html#about_receipt">c</a>',
    '<a href="/shop/enq201306270">d</a>'
  ].join("\n"));
  console.log(t.html.replace(/<a href="/g, "  -> ").replace(/">[a-d]<\/a>/g, ""));
  console.log("  置換 " + t.rewritten + " 本 / 未対応 " + t.missing.length + " 本 " + t.missing.join(" "));
}

