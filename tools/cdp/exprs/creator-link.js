(function () {
  var out = [];
  Array.from(document.querySelectorAll("a")).forEach(function (a) {
    var t = (a.innerText || "").replace(/\s+/g, " ").trim();
    if (t.indexOf("クリエイター") >= 0 || t.indexOf("デザインセット") >= 0) {
      out.push({ text: t, href: a.href, onclick: String(a.getAttribute("onclick") || "").slice(0, 160) });
    }
  });
  return out;
})()
