(function () {
  var doc = document.documentElement;
  var view = doc.clientWidth;

  /* 祖先が overflow で切っている要素ははみ出しに数えない（スライダーの中身など） */
  function clipped(e) {
    var n = e.parentElement;
    while (n && n !== doc) {
      var cs = getComputedStyle(n);
      if (cs.overflowX !== "visible") { return true; }
      n = n.parentElement;
    }
    return false;
  }

  var out = { view: view, innerWidth: window.innerWidth, scrollW: doc.scrollWidth, list: [] };
  Array.from(document.querySelectorAll("body *")).forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.right <= view + 2) { return; }
    if (clipped(e)) { return; }
    var cs = getComputedStyle(e);
    out.list.push({
      what: e.tagName + (e.id ? "#" + e.id : "") +
        (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/[\t ]+/)[0] : ""),
      right: Math.round(r.right), width: Math.round(r.width),
      cssWidth: cs.width, minWidth: cs.minWidth, position: cs.position,
      display: cs.display, float: cs.cssFloat,
      text: (e.innerText || "").replace(/[\r\n\t ]+/g, " ").trim().slice(0, 40)
    });
  });
  out.count = out.list.length;
  out.list = out.list.slice(0, 14);
  return out;
})()
