(function () {
  var t = document.querySelector("#M_group");
  if (!t) { return { found: false }; }
  var cs = getComputedStyle(t);
  var td = t.querySelector("td.itemBox");
  var img = t.querySelector("td.itemImg img");
  function box(e) {
    if (!e) { return "(無し)"; }
    var r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return Math.round(r.width) + "px  css=" + s.width + " min=" + s.minWidth + " max=" + s.maxWidth;
  }
  return {
    表: box(t),
    tableLayout: cs.tableLayout,
    セル: box(td),
    画像: box(img),
    親: box(t.parentElement),
    親の親: box(t.parentElement && t.parentElement.parentElement),
    画面: document.documentElement.clientWidth
  };
})()
