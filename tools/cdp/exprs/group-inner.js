(function () {
  var t = document.querySelector("#M_group");
  if (!t) { return { found: false }; }
  function box(e, label) {
    if (!e) { return label + " = 無し"; }
    var r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return label + " = " + Math.round(r.width) + "px  css=" + s.width + " max=" + s.maxWidth + " layout=" + s.tableLayout;
  }
  var cell = t.querySelector("td.itemBox");
  var inner = cell ? cell.querySelector("table") : null;
  var nameP = t.querySelector("p.name");
  return {
    画面: document.documentElement.clientWidth,
    外側の表: box(t, "#M_group"),
    セル: box(cell, "td.itemBox"),
    内側の表: box(inner, "inner table"),
    名前のtd: box(nameP ? nameP.parentElement : null, "td(name)"),
    名前のp: box(nameP, "p.name"),
    画像: box(t.querySelector("td.itemImg img"), "img")
  };
})()
