(function () {
  function flat(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  var cells = document.querySelectorAll("td.itemtext");
  var first = cells[0] || null;
  var srcs = {};
  Array.prototype.forEach.call(document.querySelectorAll("td.itemtext img, td.categorylist img, .O_ItemLine img"), function (i) {
    var u = (i.currentSrc || i.src || "").split("/").pop().split("?")[0];
    srcs[u] = (srcs[u] || 0) + 1;
  });
  var icons = Object.entries(srcs).filter(function (e) { return /icon|sero|white|nashi|maru/i.test(e[0]); });
  return {
    商品セル: cells.length,
    先頭セルの文字: first ? flat(first.innerText).slice(0, 160) : "(無し)",
    先頭セルの画像: first ? Array.prototype.map.call(first.querySelectorAll("img"), function (i) {
      return (i.currentSrc || i.src || "").split("/").pop().split("?")[0];
    }) : [],
    一覧のアイコン: icons.sort(function (a, b) { return b[1] - a[1]; }).slice(0, 14)
      .map(function (e) { return e[1] + "  " + e[0]; }),
    一覧の画像種類: Object.keys(srcs).length
  };
})()
