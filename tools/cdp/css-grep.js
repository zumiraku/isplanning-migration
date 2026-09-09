/* ---------------------------------------------------------------------------
   css-grep.js — 配信されている自前CSSを取ってきて、文字で探します

     node tools/cdp/css-grep.js headerWrap [page_type]

   document.styleSheets は他所のCSSを読めません（SecurityError）。
   自前のCSSは同一オリジンなので fetch すれば読めます。
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const NEEDLE = process.argv[2] || "headerWrap";
const TYPE = Number(process.argv[3] || 2);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function probe(needle) {
  return `(function () {
    var needle = ${JSON.stringify(needle)};
    var links = Array.from(document.querySelectorAll("link[rel=stylesheet]")).map(function (l) { return l.href; });
    var inline = Array.from(document.querySelectorAll("style")).map(function (s) { return s.textContent; });
    return Promise.all(links.map(function (u) {
      return fetch(u).then(function (r) { return r.text(); })
        .then(function (t) { return { u: u, t: t }; })
        .catch(function (e) { return { u: u, t: "", err: String(e).slice(0, 50) }; });
    })).then(function (all) {
      inline.forEach(function (t, i) { all.push({ u: "(インライン " + i + ")", t: t }); });
      var out = [];
      all.forEach(function (s) {
        var name = s.u.split("/").slice(-1)[0].slice(0, 46);
        if (s.err) { out.push({ name: name, err: s.err }); return; }
        var idx = 0, found = [];
        while (found.length < 40) {
          var at = s.t.indexOf(needle, idx);
          if (at < 0) { break; }
          var open = s.t.lastIndexOf("}", at);
          var start = Math.max(0, open + 1);
          var close = s.t.indexOf("}", at);
          found.push(s.t.slice(start, close < 0 ? at + 120 : close + 1).replace(/[\\r\\n\\t ]+/g, " ").trim().slice(0, 200));
          idx = at + needle.length;
        }
        if (found.length) { out.push({ name: name, len: s.t.length, found: found }); }
      });
      return out;
    });
  })()`;
}

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(3500);
  const r = await p.evaluate(probe(NEEDLE));

  r.forEach(function (s) {
    if (s.err) { console.log("--- " + s.name + "  読めません: " + s.err); return; }
    console.log("--- " + s.name + "  (" + s.len + "字)  " + s.found.length + " 件");
    s.found.forEach(function (f) { console.log("    " + f); });
  });
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
