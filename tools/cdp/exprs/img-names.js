(function () {
  var count = {};
  Array.prototype.forEach.call(document.querySelectorAll("img"), function (i) {
    var u = (i.currentSrc || i.getAttribute("src") || "").split("?")[0].split("/").pop();
    if (!u) { u = "(srcなし)"; }
    count[u] = (count[u] || 0) + 1;
  });
  Array.prototype.forEach.call(document.querySelectorAll("body *"), function (e) {
    var v = getComputedStyle(e).backgroundImage;
    if (!v || v === "none" || v.indexOf("url(") < 0) { return; }
    (v.match(/url\((['"]?)([^'")]+)\1\)/g) || []).forEach(function (m) {
      var u = m.replace(/^url\((['"]?)/, "").replace(/(['"]?)\)$/, "");
      if (u.indexOf("data:") === 0) { return; }
      u = "背景:" + u.split("?")[0].split("/").pop();
      count[u] = (count[u] || 0) + 1;
    });
  });
  return count;
})()
