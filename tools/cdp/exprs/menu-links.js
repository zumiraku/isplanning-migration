(function () {
  var out = [];
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    var t = (a.innerText || "").replace(/\s+/g, " ").trim();
    if (!t) { return; }
    if (/CSV|一括|ダウンロード|アップロード|商品一覧|商品設定/.test(t)) {
      out.push({ text: t, href: a.href });
    }
  });
  return out;
})()
