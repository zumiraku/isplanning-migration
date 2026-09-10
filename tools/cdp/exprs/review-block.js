(function () {
  var d = document.querySelector("div.Review");
  var out = { found: !!d };
  if (d) {
    out.text = (d.textContent || "").replace(/\s+/g, " ").trim().slice(0, 200);
    out.html = (d.innerHTML || "").replace(/\s+/g, " ").trim().slice(0, 400);
    out.links = Array.prototype.map.call(d.querySelectorAll("a"), function (a) {
      return "href=[" + (a.getAttribute("href") === null ? "属性なし" : a.getAttribute("href")) +
        "] 文字=[" + (a.textContent || "").replace(/\s+/g, "") + "]";
    });
    var s = d.nextElementSibling;
    out.next = s ? (s.tagName + "." + s.className + " 中身=[" +
      (s.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120) + "]") : "(次の要素なし)";
  }
  var w = document.querySelector(".review-container");
  out.widget = w ? "あり 高さ" + Math.round(w.getBoundingClientRect().height) : "無し";
  return out;
})()
