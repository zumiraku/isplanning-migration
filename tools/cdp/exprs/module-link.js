(function () {
  var out = [];
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    var t = (a.innerText || "").replace(/\s+/g, " ").trim();
    if (t.indexOf("モジュール") >= 0 || t.indexOf("フリーページ") >= 0) {
      out.push({ text: t, href: a.href });
    }
  });
  return out;
})()
