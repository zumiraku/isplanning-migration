(function () {
  function label(e) {
    var n = e, path = [];
    while (n && n !== document.body && path.length < 6) {
      path.unshift(n.tagName + (n.id ? "#" + n.id : "") +
        (typeof n.className === "string" && n.className ? "." + n.className.trim().split(/\s+/)[0] : ""));
      n = n.parentElement;
    }
    return path.slice(0, 3).join(">");
  }
  var count = {};
  Array.prototype.forEach.call(document.querySelectorAll("img"), function (i) {
    var k = label(i);
    count[k] = (count[k] || 0) + 1;
  });
  var rows = Object.entries(count).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 14);
  return {
    合計: document.querySelectorAll("img").length,
    内訳: rows.map(function (r) { return String(r[1]).padStart(4) + "  " + r[0]; }),
    headのtitle数: document.querySelectorAll("head title").length,
    titleの中身: Array.prototype.map.call(document.querySelectorAll("head title"), function (t) { return t.textContent; })
  };
})()
